/**
 * OpenClaw Next - Channel Interfaces
 * Standardized message format for multi-channel support (WhatsApp, Telegram, Discord)
 */

export interface NormalizedMessage {
  id: string;
  source: string; // 'whatsapp', 'telegram', 'console'
  senderId: string;
  senderName?: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  attachments?: Attachment[];
}

export interface Attachment {
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  mimeType: string;
  size?: number;
}

export interface ChannelConfig {
  id: string;
  type: string;
  enabled: boolean;
  credentials: Record<string, unknown>;
}

export interface ChannelAdapter {
  id: string;
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(to: string, message: string): Promise<void>;
  sendAttachment?(to: string, attachment: Attachment): Promise<void>;
  onMessage(handler: (msg: NormalizedMessage) => void): void;
}
