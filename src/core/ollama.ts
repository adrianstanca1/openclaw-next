/**
 * OpenClaw Next - Ollama Integration Module
 * Local and Cloud Ollama API client with smart routing
 */

import { configManager, type OllamaConfig } from './config.js';
import { generateId, formatDuration } from './utils.js';

/**
 * Ollama model information
 */
export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: {
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

/**
 * Generate request parameters
 */
export interface GenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  template?: string;
  context?: number[];
  stream?: boolean;
  raw?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    stop?: string[];
    seed?: number;
    [key: string]: unknown;
  };
}

/**
 * Generate response
 */
export interface GenerateResponse {
  model: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Chat message
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  images?: string[];
}

/**
 * Chat request
 */
export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    [key: string]: unknown;
  };
  tools?: unknown[];
}

/**
 * Chat response
 */
export interface ChatResponse {
  model: string;
  message: ChatMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Embedding request
 */
export interface EmbeddingRequest {
  model: string;
  prompt: string;
  options?: Record<string, unknown>;
}

/**
 * Embedding response
 */
export interface EmbeddingResponse {
  embedding: number[];
}

/**
 * Ollama error
 */
export class OllamaError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'OllamaError';
  }
}

/**
 * Connection status
 */
export interface ConnectionStatus {
  connected: boolean;
  endpoint: string;
  mode: 'local' | 'cloud' | 'unavailable';
  latency: number;
  version?: string;
  error?: string;
}

/**
 * Model capabilities
 */
export interface ModelCapabilities {
  chat: boolean;
  generate: boolean;
  embeddings: boolean;
  vision: boolean;
  tools: boolean;
  maxContextLength: number;
}

/**
 * Ollama client for local and cloud API
 */
export class OllamaClient {
  private config: OllamaConfig;
  private baseUrl: string = 'http://localhost:11434';
  private headers: Record<string, string> = {};
  private abortController: AbortController | null = null;

  constructor(config?: OllamaConfig) {
    this.config = config || configManager.getSection('ollama');
    this.updateEndpoint();
  }

  /**
   * Update configuration
   */
  updateConfig(config: OllamaConfig): void {
    this.config = config;
    this.updateEndpoint();
  }

  /**
   * Determine which endpoint to use
   */
  private updateEndpoint(): void {
    if (this.config.cloud?.enabled && this.config.cloud.apiKey) {
      this.baseUrl = this.config.cloud.endpoint;
      this.headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.cloud.apiKey}`,
      };
    } else if (this.config.local.enabled) {
      this.baseUrl = this.config.local.endpoint;
      this.headers = {
        'Content-Type': 'application/json',
      };
    } else {
      this.baseUrl = '';
      this.headers = {};
    }
  }

  /**
   * Get current mode
   */
  getMode(): 'local' | 'cloud' | 'unavailable' {
    if (!this.config.enabled) return 'unavailable';
    if (this.config.cloud?.enabled && this.config.cloud.apiKey) return 'cloud';
    if (this.config.local.enabled) return 'local';
    return 'unavailable';
  }

  /**
   * Check connection status
   */
  async checkConnection(): Promise<ConnectionStatus> {
    const startTime = Date.now();
    const mode = this.getMode();

    if (mode === 'unavailable') {
      return {
        connected: false,
        endpoint: '',
        mode,
        latency: 0,
        error: 'Ollama is disabled',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: this.headers,
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new OllamaError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      const latency = Date.now() - startTime;
      const data = await response.json();

      return {
        connected: true,
        endpoint: this.baseUrl,
        mode,
        latency,
        version: data.version,
      };
    } catch (error) {
      return {
        connected: false,
        endpoint: this.baseUrl,
        mode,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<OllamaModel[]> {
    const response = await this.fetchApi('/api/tags') as { models?: OllamaModel[] };
    return response.models || [];
  }

  /**
   * Generate text completion
   */
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const response = await this.fetchApi('/api/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return response as GenerateResponse;
  }

  /**
   * Generate streaming response
   */
  async *generateStream(
    request: GenerateRequest
  ): AsyncGenerator<Partial<GenerateResponse>> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!response.ok) {
      throw new OllamaError(
        `HTTP ${response.status}: ${response.statusText}`,
        'HTTP_ERROR',
        response.status
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new OllamaError('No response body', 'NO_BODY');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              yield data;
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Chat completion
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.fetchApi('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return response as ChatResponse;
  }

  /**
   * Chat streaming
   */
  async *chatStream(
    request: ChatRequest
  ): AsyncGenerator<Partial<ChatResponse>> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!response.ok) {
      throw new OllamaError(
        `HTTP ${response.status}: ${response.statusText}`,
        'HTTP_ERROR',
        response.status
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new OllamaError('No response body', 'NO_BODY');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              yield data;
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Generate embeddings
   */
  async generateEmbeddings(
    request: EmbeddingRequest
  ): Promise<EmbeddingResponse> {
    const response = await this.fetchApi('/api/embeddings', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return response as EmbeddingResponse;
  }

  /**
   * Batch embeddings
   */
  async batchEmbeddings(
    texts: string[],
    model?: string
  ): Promise<number[][]> {
    const embeddingModel = model || this.config.embeddingModel || 'nomic-embed-text';

    const embeddings: number[][] = [];

    for (const text of texts) {
      try {
        const response = await this.generateEmbeddings({
          model: embeddingModel,
          prompt: text,
        });
        embeddings.push(response.embedding);
      } catch (error) {
        console.error('Embedding generation failed:', error);
        embeddings.push([]);
      }
    }

    return embeddings;
  }

  /**
   * Pull a model
   */
  async pullModel(
    name: string,
    stream?: (progress: { status: string; completed?: number; total?: number }) => void
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ name, stream: !!stream }),
    });

    if (!response.ok) {
      throw new OllamaError(
        `HTTP ${response.status}: ${response.statusText}`,
        'HTTP_ERROR',
        response.status
      );
    }

    if (stream) {
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                stream(data);
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  }

  /**
   * Delete a model
   */
  async deleteModel(name: string): Promise<void> {
    await this.fetchApi('/api/delete', {
      method: 'DELETE',
      body: JSON.stringify({ name }),
    });
  }

  /**
   * Get model capabilities
   */
  getModelCapabilities(model: string): ModelCapabilities {
    const name = model.toLowerCase();

    // Vision models
    const visionModels = ['llava', 'bakllava', 'llama3.2-vision'];

    // Tool-capable models
    const toolModels = ['llama3.1', 'qwen2.5', 'mistral'];

    // Embedding models
    const embeddingModels = ['nomic-embed-text', 'mxbai-embed-large'];

    const capabilities: ModelCapabilities = {
      chat: !embeddingModels.some((m) => name.includes(m)),
      generate: !embeddingModels.some((m) => name.includes(m)),
      embeddings: embeddingModels.some((m) => name.includes(m)),
      vision: visionModels.some((m) => name.includes(m)),
      tools: toolModels.some((m) => name.includes(m)),
      maxContextLength: this.getMaxContextLength(name),
    };

    return capabilities;
  }

  /**
   * Get max context length for model
   */
  private getMaxContextLength(model: string): number {
    if (model.includes('llama3.1') || model.includes('llama3.2')) return 128000;
    if (model.includes('mistral')) return 32000;
    if (model.includes('qwen2.5')) return 128000;
    if (model.includes('phi3')) return 128000;
    if (model.includes('llama3')) return 8000;
    return 4096;
  }

  /**
   * Smart model selection based on task
   */
  async selectModelForTask(
    task: 'chat' | 'generate' | 'embeddings' | 'vision' | 'tools'
  ): Promise<string> {
    const models = await this.listModels();

    // Filter by capability
    const candidates = models.filter((m) => {
      const caps = this.getModelCapabilities(m.name);
      return caps[task];
    });

    if (candidates.length === 0) {
      // Fallback to defaults
      const defaults: Record<typeof task, string> = {
        chat: 'gemma3',
        generate: 'gemma3',
        embeddings: 'nomic-embed-text',
        vision: 'llava',
        tools: 'gemma3',
      };
      return defaults[task];
    }

    // Return first available (could be smarter based on size/preferences)
    return candidates[0].name;
  }

  /**
   * Abort ongoing requests
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Make API request with error handling
   */
  private async fetchApi(path: string, options: RequestInit = {}): Promise<unknown> {
    if (!this.baseUrl) {
      throw new OllamaError('Ollama is not configured', 'NOT_CONFIGURED');
    }

    const url = `${this.baseUrl}${path}`;

    this.abortController = new AbortController();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new OllamaError(
          `HTTP ${response.status}: ${text || response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof OllamaError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new OllamaError('Request aborted', 'ABORTED');
      }
      throw new OllamaError(
        error instanceof Error ? error.message : 'Unknown error',
        'FETCH_ERROR'
      );
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Run health check with retries
   */
  async healthCheck(retries = 3, delay = 1000): Promise<ConnectionStatus> {
    for (let i = 0; i < retries; i++) {
      const status = await this.checkConnection();
      if (status.connected) return status;

      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return this.checkConnection();
  }

  /**
   * Get recommended models for OpenClaw
   */
  getRecommendedModels(): Array<{ name: string; description: string; tags: string[] }> {
    return [
      {
        name: 'gemma3',
        description: 'Newest Google model, highly capable for reasoning and tools',
        tags: ['new', 'recommended', 'tools'],
      },
      {
        name: 'llama3.1',
        description: 'Best all-around model for agents',
        tags: ['recommended', 'tools', '128k-context'],
      },
      {
        name: 'llama3.2',
        description: 'Fast, efficient for most tasks',
        tags: ['fast', 'recommended'],
      },
      {
        name: 'qwen2.5',
        description: 'Excellent reasoning and coding',
        tags: ['coding', 'reasoning', '128k-context'],
      },
      {
        name: 'mistral',
        description: 'Good balance of quality and speed',
        tags: ['balanced', '32k-context'],
      },
      {
        name: 'codellama',
        description: 'Specialized for code generation',
        tags: ['coding', 'specialized'],
      },
      {
        name: 'nomic-embed-text',
        description: 'Best embeddings for RAG',
        tags: ['embeddings', 'recommended'],
      },
      {
        name: 'llava',
        description: 'Vision-capable model',
        tags: ['vision', 'multimodal'],
      },
    ];
  }
}

/**
 * Global Ollama client instance
 */
export const ollamaClient = new OllamaClient();

/**
 * Initialize Ollama connection
 */
export async function initOllama(): Promise<{
  success: boolean;
  status: ConnectionStatus;
  models: OllamaModel[];
}> {
  const status = await ollamaClient.healthCheck();

  let models: OllamaModel[] = [];
  if (status.connected) {
    try {
      models = await ollamaClient.listModels();
    } catch {
      // Ignore errors
    }
  }

  return {
    success: status.connected,
    status,
    models,
  };
}

/**
 * Get Ollama client
 */
export function getOllamaClient(): OllamaClient {
  return ollamaClient;
}

/**
 * Check if Ollama is available
 */
export async function isOllamaAvailable(): Promise<boolean> {
  const status = await ollamaClient.checkConnection();
  return status.connected;
}
