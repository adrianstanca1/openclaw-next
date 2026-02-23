/**
 * OpenClaw Next - OpenAI Provider
 * Placeholder for OpenAI API integration
 */

import type { LLMProvider, LLMRequest, LLMResponse } from '../types.js';

export class OpenAIProvider implements LLMProvider {
  name: string = 'openai';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async listModels(): Promise<string[]> {
    return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    if (!this.apiKey) throw new Error('OpenAI API key not configured');
    
    // In a real implementation, we would use 'openai' package or fetch
    // const response = await fetch('https://api.openai.com/v1/chat/completions', ...);
    
    throw new Error('OpenAI Provider not yet implemented');
  }
}
