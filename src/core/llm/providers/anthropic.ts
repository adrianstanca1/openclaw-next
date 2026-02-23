/**
 * OpenClaw Next - Anthropic Provider
 * Placeholder for Anthropic API integration
 */

import type { LLMProvider, LLMRequest, LLMResponse } from '../types.js';

export class AnthropicProvider implements LLMProvider {
  name: string = 'anthropic';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async listModels(): Promise<string[]> {
    return ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'];
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    if (!this.apiKey) throw new Error('Anthropic API key not configured');
    
    // In a real implementation, we would use 'anthropic' package or fetch
    // const response = await fetch('https://api.anthropic.com/v1/messages', ...);
    
    throw new Error('Anthropic Provider not yet implemented');
  }
}
