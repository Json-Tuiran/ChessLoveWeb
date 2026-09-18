import mqtt, { MqttClient as MqttClientInstance } from 'mqtt';
import { NetworkMessage } from './types';

export type MessageHandler = (topic: string, message: NetworkMessage) => void;

export class MqttService {
  private client: MqttClientInstance | null = null;
  private primaryBroker = 'wss://broker.hivemq.com:8884/mqtt';
  private backupBroker = 'wss://broker.emqx.io:8084/mqtt';
  private currentBroker: string = this.primaryBroker;
  private currentSubscribedTopics: Set<string> = new Set();
  private listeners: Set<MessageHandler> = new Set();
  public isConnected: boolean = false;
  private userId: string;

  private localChannel: BroadcastChannel | null = null;
  private recentMessageKeys: Set<string> = new Set();
  private clientId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.clientId = `chesslove_${this.userId}_${Math.random().toString(16).substring(2, 8)}`;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.localChannel = new BroadcastChannel('chesslove_local_bus');
        this.localChannel.onmessage = (event) => {
          const { topic, message, senderClient } = event.data || {};
          if (senderClient !== this.clientId && topic && message) {
            if (this.currentSubscribedTopics.has(topic)) {
              this.dispatchMessage(topic, message);
            }
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported or error:', err);
      }
    }
  }

  private dispatchMessage(topic: string, message: NetworkMessage) {
    // Deduplication check
    const msg = message as any;
    const dedupeKey = msg.msgId
      ? `id_${msg.msgId}`
      : `${topic}_${msg.senderId || ''}_${msg.type}_${msg.timestamp || ''}_${msg.fromRow !== undefined ? `${msg.fromRow}-${msg.toRow}` : ''}`;

    if (this.recentMessageKeys.has(dedupeKey)) {
      return;
    }
    this.recentMessageKeys.add(dedupeKey);
    if (this.recentMessageKeys.size > 200) {
      const first = this.recentMessageKeys.values().next().value;
      if (first) this.recentMessageKeys.delete(first);
    }

    this.listeners.forEach(listener => {
      try {
        listener(topic, message);
      } catch (err) {
        console.error('Error in message listener:', err);
      }
    });
  }

  public connect(): Promise<boolean> {
    return new Promise(resolve => {
      if (this.client && this.isConnected) {
        resolve(true);
        return;
      }

      const lwtPayload = JSON.stringify({
        type: 'PRESENCE_PING',
        senderId: this.userId,
        status: 'OFFLINE',
        timestamp: Date.now(),
      });

      this.client = mqtt.connect(this.currentBroker, {
        clientId: this.clientId,
        clean: true,
        reconnectPeriod: 3000,
        connectTimeout: 5000,
        will: {
          topic: `chesslove/presence/${this.userId}`,
          payload: (typeof Buffer !== 'undefined' ? (Buffer as any).from(lwtPayload) : new TextEncoder().encode(lwtPayload)) as any,
          qos: 1,
          retain: false,
        },
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        // Re-subscribe to any previously active topics
        this.currentSubscribedTopics.forEach(topic => {
          this.client?.subscribe(topic);
        });
        resolve(true);
      });

      this.client.on('error', err => {
        console.warn(`MQTT connection error on ${this.currentBroker}:`, err);
        // Switch to backup broker if primary fails
        if (this.currentBroker === this.primaryBroker) {
          this.currentBroker = this.backupBroker;
          this.client?.end(true);
          this.connect().then(resolve);
        }
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });

      this.client.on('message', (topic, payload) => {
        try {
          const text = typeof payload === 'string' ? payload : new TextDecoder().decode(payload as any);
          const parsed = JSON.parse(text) as NetworkMessage;
          this.dispatchMessage(topic, parsed);
        } catch (err) {
          console.error('Failed to parse MQTT message payload:', err);
        }
      });
    });
  }

  public subscribe(topic: string) {
    this.currentSubscribedTopics.add(topic);
    if (this.client && this.isConnected) {
      this.client.subscribe(topic, { qos: 1 });
    }
  }

  public unsubscribe(topic: string) {
    this.currentSubscribedTopics.delete(topic);
    if (this.client && this.isConnected) {
      this.client.unsubscribe(topic);
    }
  }

  public publish(topic: string, message: NetworkMessage) {
    // 1. Instant local delivery via BroadcastChannel
    if (this.localChannel) {
      try {
        this.localChannel.postMessage({
          topic,
          message,
          senderClient: this.clientId,
        });
      } catch (err) {
        console.warn('Error broadcasting locally:', err);
      }
    }

    // 2. Remote broker delivery
    if (this.client && this.isConnected) {
      const payload = JSON.stringify(message);
      this.client.publish(topic, payload, { qos: 1 });
    }
  }

  public addListener(handler: MessageHandler) {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  public disconnect() {
    if (this.localChannel) {
      this.localChannel.close();
      this.localChannel = null;
    }
    if (this.client) {
      this.client.end(true);
      this.client = null;
      this.isConnected = false;
      this.currentSubscribedTopics.clear();
      this.listeners.clear();
    }
  }
}
