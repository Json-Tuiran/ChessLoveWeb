import { PieceColor, PieceType } from '../engine/types';

export type MqttMessageType =
  | 'ROOM_ANNOUNCE'
  | 'JOIN_REQUEST'
  | 'JOIN_CONFIRM'
  | 'MOVE'
  | 'TEACHER_ARROW'
  | 'HIGHLIGHT'
  | 'CLEAR_ANNOTATIONS'
  | 'SECURE_CHAT_MESSAGE'
  | 'REACTION'
  | 'PRESENCE_PING'
  | 'COUPLE_HANDSHAKE'
  | 'GAME_RESTART'
  | 'RESIGN';

export interface RoomAnnounceMessage {
  type: 'ROOM_ANNOUNCE';
  roomId: string;
  roomCode: string;
  hostId: string;
  hostName: string;
  hostColor: PieceColor;
}

export interface JoinRequestMessage {
  type: 'JOIN_REQUEST';
  roomId: string;
  roomCode: string;
  guestId: string;
  guestName: string;
}

export interface JoinConfirmMessage {
  type: 'JOIN_CONFIRM';
  roomCode: string;
  hostColor: PieceColor;
  guestId: string;
  boardFen: string;
}

export interface MoveNetworkMessage {
  type: 'MOVE';
  senderId: string;
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  promotionType?: PieceType | null;
}

export interface TeacherArrowMessage {
  type: 'TEACHER_ARROW';
  senderId: string;
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
}

export interface HighlightMessage {
  type: 'HIGHLIGHT';
  senderId: string;
  row: number;
  col: number;
  color?: string;
}

export interface ClearAnnotationsMessage {
  type: 'CLEAR_ANNOTATIONS';
  senderId: string;
}

export interface SecureChatMessage {
  type: 'SECURE_CHAT_MESSAGE';
  msgId: string;
  senderId: string;
  senderName: string;
  iv: string;
  cipher: string;
  timestamp: number;
}

export interface ChatContent {
  text?: string;
  audioBase64?: string; // WebM/Opus audio in base64
  linkedMove?: string;
}

export interface ReactionMessage {
  type: 'REACTION';
  senderId: string;
  emoji: string;
}

export interface PresencePingMessage {
  type: 'PRESENCE_PING';
  senderId: string;
  senderName?: string;
  status: 'ONLINE' | 'OFFLINE';
  timestamp: number;
}

export interface GenericControlMessage {
  type: 'GAME_RESTART' | 'RESIGN';
  senderId: string;
}

export interface CoupleHandshakeMessage {
  type: 'COUPLE_HANDSHAKE';
  senderId: string;
  senderName: string;
  timestamp: number;
}

export type NetworkMessage =
  | RoomAnnounceMessage
  | JoinRequestMessage
  | JoinConfirmMessage
  | MoveNetworkMessage
  | TeacherArrowMessage
  | HighlightMessage
  | ClearAnnotationsMessage
  | SecureChatMessage
  | ReactionMessage
  | PresencePingMessage
  | CoupleHandshakeMessage
  | GenericControlMessage;
