/**
 * OpenClaw Next - Unified LLM Interface
 * Standardized request/response format for multi-model support (OpenAI, Anthropic, Ollama, Google)
 */

export interface LLMRequest {
  model: string;
  messages: LLMMessage[];
  system?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  tools?: LLMToolDefinition[];
  toolChoice?: 'auto' | 'none' | string;
  stream?: boolean;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: LLMToolCall[];
  toolCallId?: string;
}

export interface LLMToolDefinition {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>; // JSON Schema
  };
}

export interface LLMToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface LLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: LLMMessage;
    finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  }[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  listModels(): Promise<string[]>;
  chat(request: LLMRequest): Promise<LLMResponse>;
  generateEmbeddings?(texts: string[]): Promise<number[][]>;
}

export interface ModelConfig {
  provider: 'ollama' | 'openai' | 'anthropic' | 'google';
  apiKey?: string;
  endpoint?: string;
  modelMapping?: Record<string, string>; // Maps logical names (e.g., 'gpt-4o') to provider-specific names
}
