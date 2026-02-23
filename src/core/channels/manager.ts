/**
 * OpenClaw Next - Channel Manager
 * Registry and lifecycle management for communication channels
 */

import { EventEmitter } from 'events';
import type { ChannelAdapter, NormalizedMessage } from './types.js';
import { agentManager } from '../../agents/index.js';
import { apiServer } from '../api-server.js';

export class ChannelManager extends EventEmitter {
  private channels: Map<string, ChannelAdapter> = new Map();
  private isRunning: boolean = false;

  constructor() {
    super();
  }

  /**
   * Register a new channel adapter
   */
  registerChannel(channel: ChannelAdapter) {
    if (this.channels.has(channel.id)) {
      throw new Error(`Channel with ID ${channel.id} already registered`);
    }
    
    this.channels.set(channel.id, channel);
    
    // Subscribe to messages
    channel.onMessage((msg) => this.handleIncomingMessage(msg));
  }

  /**
   * Start all channels
   */
  async startAll() {
    if (this.isRunning) return;
    
    console.log('[Channels] Starting all adapters...');
    this.isRunning = true;
    
    for (const [id, channel] of this.channels) {
      try {
        await channel.connect();
        console.log(`[Channels] Connected: ${channel.name} (${id})`);
      } catch (error) {
        console.error(`[Channels] Failed to connect ${id}:`, error);
      }
    }
  }

  /**
   * Stop all channels
   */
  async stopAll() {
    for (const [id, channel] of this.channels) {
      try {
        await channel.disconnect();
      } catch (error) {
        console.error(`[Channels] Error disconnecting ${id}:`, error);
      }
    }
    this.isRunning = false;
  }

  /**
   * Central message router with Agent bridge
   */
  private async handleIncomingMessage(msg: NormalizedMessage) {
    console.log(`[Message] From ${msg.source}/${msg.senderId}: ${msg.content.substring(0, 50)}...`);
    
    // 1. Notify UI via WebSocket
    apiServer.broadcast('message_received', msg);

    // 2. Resolve session ID
    const sessionId = `${msg.source}_${msg.senderId}`;

    try {
      // 3. Trigger Agent Execution
      const agents = agentManager.getAllAgents();
      // Default to Project CEO for incoming channel messages
      const targetAgent = agents.find(a => a.id === 'ceo-agent') || agents[0];

      if (!targetAgent) {
        console.warn('[Channels] No agents available to handle message');
        return;
      }

      const result = await (agentManager as any).executor.executeRun(targetAgent.id, {
        message: msg.content,
        context: { workspace: sessionId }
      });

      // 4. Send Response back to the source channel
      if (result.success && result.output?.response) {
        await this.sendMessage(msg.source, msg.senderId, result.output.response);
        
        // Notify UI of agent response
        apiServer.broadcast('agent_replied', {
          recipientId: msg.senderId,
          content: result.output.response
        });
      }
    } catch (error) {
      console.error('[Channels] Agent processing failed:', error);
      await this.sendMessage(msg.source, msg.senderId, "⚠️ I encountered an error while processing your request.");
    }
  }

  /**
   * Send message to a specific channel
   */
  async sendMessage(channelId: string, recipientId: string, content: string) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }
    
    await channel.sendMessage(recipientId, content);
  }
}

export const channelManager = new ChannelManager();
