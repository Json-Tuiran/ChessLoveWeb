import { MqttService } from './MqttClient';
import { PresencePingMessage } from './types';

export class PresenceWatchdog {
  private mqtt: MqttService;
  private userId: string;
  private coupleCode: string | null = null;
  private userName: string = '';
  private onPartnerFound?: (name: string) => void;
  private pingInterval: number | null = null;
  private watchdogTimeout: number | null = null;
  private lastPartnerPingTime: number = 0;
  private partnerOnline: boolean = false;
  private statusListeners: Set<(isOnline: boolean) => void> = new Set();

  constructor(mqtt: MqttService, userId: string) {
    this.mqtt = mqtt;
    this.userId = userId;
  }

  public setCouple(coupleCode: string | null, userName: string, onPartnerFound?: (name: string) => void) {
    if (this.coupleCode) {
      this.mqtt.unsubscribe(`chesslove/couple/${this.coupleCode}/presence`);
    }

    this.coupleCode = coupleCode;
    this.userName = userName;
    this.onPartnerFound = onPartnerFound;
    this.partnerOnline = false;
    this.lastPartnerPingTime = 0;
    this.notifyStatus(false);

    if (this.coupleCode) {
      this.mqtt.subscribe(`chesslove/couple/${this.coupleCode}/presence`);
      this.sendPing('ONLINE');
    }
  }

  // Backwards-compatible alias
  public setPartner(codeOrId: string | null) {
    this.setCouple(codeOrId, this.userName, this.onPartnerFound);
  }

  public start() {
    this.stop();

    // 1. Send periodic ping every 10 seconds
    this.sendPing('ONLINE');
    this.pingInterval = window.setInterval(() => {
      this.sendPing('ONLINE');
    }, 10000);

    // 2. Check partner liveness every 4 seconds (20s timeout)
    this.watchdogTimeout = window.setInterval(() => {
      if (!this.coupleCode) return;

      const elapsed = Date.now() - this.lastPartnerPingTime;
      if (this.partnerOnline && elapsed > 20000) {
        this.partnerOnline = false;
        this.notifyStatus(false);
      }
    }, 4000);

    // 3. Listen to MQTT messages
    this.mqtt.addListener((_topic, msg) => {
      if (msg.type === 'PRESENCE_PING') {
        const ping = msg as PresencePingMessage;
        if (ping.senderId !== this.userId) {
          if (ping.status === 'OFFLINE') {
            this.partnerOnline = false;
            this.notifyStatus(false);
          } else {
            this.lastPartnerPingTime = Date.now();
            if (!this.partnerOnline) {
              this.partnerOnline = true;
              this.notifyStatus(true);
            }
            if (ping.senderName && this.onPartnerFound) {
              this.onPartnerFound(ping.senderName);
            }
          }
        }
      }
    });
  }

  public sendPing(status: 'ONLINE' | 'OFFLINE') {
    if (!this.coupleCode) return;

    const ping: PresencePingMessage = {
      type: 'PRESENCE_PING',
      senderId: this.userId,
      senderName: this.userName,
      status,
      timestamp: Date.now(),
    };
    this.mqtt.publish(`chesslove/couple/${this.coupleCode}/presence`, ping);
  }

  public stop() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.watchdogTimeout) {
      clearInterval(this.watchdogTimeout);
      this.watchdogTimeout = null;
    }
  }

  public onStatusChange(callback: (isOnline: boolean) => void) {
    this.statusListeners.add(callback);
    callback(this.partnerOnline);
    return () => this.statusListeners.delete(callback);
  }

  private notifyStatus(status: boolean) {
    this.statusListeners.forEach(cb => cb(status));
  }
}
