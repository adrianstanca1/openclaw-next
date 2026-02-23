/**
 * OpenClaw Next - Configuration Management System
 * Secure, hierarchical configuration with credential handling
 */

// Types are used within the file

/**
 * Configuration sources in priority order
 */
export type ConfigSource = 'env' | 'file' | 'localStorage' | 'remote' | 'default';

/**
 * Sensitive fields that require encryption/handling
 */
export const SENSITIVE_FIELDS = [
  'apiKey',
  'apiSecret',
  'token',
  'password',
  'privateKey',
  'secret',
] as const;

/**
 * Configuration schema for validation
 */
export interface ConfigSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  default?: unknown;
  sensitive?: boolean;
  validator?: (value: unknown) => boolean;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  name: string;
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  model?: string;
  options?: Record<string, unknown>;
}

/**
 * Ollama configuration
 */
export interface OllamaConfig {
  enabled: boolean;
  local: {
    enabled: boolean;
    endpoint: string;
    defaultModel: string;
  };
  cloud?: {
    enabled: boolean;
    apiKey: string;
    endpoint: string;
    defaultModel: string;
  };
  models: string[];
  embeddingModel?: string;
}

/**
 * Gateway configuration
 */
export interface GatewayConfig {
  url: string;
  token: string;
  timeout: number;
  reconnect: {
    enabled: boolean;
    initialDelay: number;
    maxDelay: number;
    factor: number;
  };
}

/**
 * Dashboard configuration
 */
export interface DashboardConfig {
  theme: 'dark' | 'light' | 'system';
  language: string;
  sidebarCollapsed: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  layout: {
    defaultView: string;
    pinnedViews: string[];
    customCSS?: string;
  };
}

/**
 * Channels configuration
 */
export interface ChannelsConfig {
  telegram?: {
    token: string;
    webhookUrl?: string;
    allowedUsers?: string[];
  };
  whatsapp?: {
    enabled: boolean;
  };
}

/**
 * Complete application configuration
 */
export interface AppConfig {
  version: string;
  environment: 'development' | 'staging' | 'production';
  gateway: GatewayConfig;
  ollama: OllamaConfig;
  providers: {
    openai?: ProviderConfig;
    anthropic?: ProviderConfig;
    groq?: ProviderConfig;
    [key: string]: ProviderConfig | undefined;
  };
  channels?: ChannelsConfig;
  dashboard: DashboardConfig;
  features: {
    agentDelegation: boolean;
    multiTenant: boolean;
    marketplace: boolean;
    analytics: boolean;
    plugins: boolean;
  };
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: AppConfig = {
  version: '1.0.0',
  environment: 'development',
  gateway: {
    url: 'ws://localhost:18789',
    token: '',
    timeout: 30000,
    reconnect: {
      enabled: true,
      initialDelay: 1000,
      maxDelay: 30000,
      factor: 2,
    },
  },
  ollama: {
    enabled: true,
    local: {
      enabled: true,
      endpoint: 'http://localhost:11434',
      defaultModel: 'gemma3',
    },
    models: [
      'gemma3',
      'llama3.1',
      'llama3.2',
      'mistral',
      'codellama',
      'qwen2.5',
      'phi3',
    ],
    embeddingModel: 'nomic-embed-text',
  },
  providers: {},
  channels: {},
  dashboard: {
    theme: 'dark',
    language: 'en',
    sidebarCollapsed: false,
    autoRefresh: true,
    refreshInterval: 30000,
    notifications: {
      enabled: true,
      sound: false,
      desktop: true,
    },
    layout: {
      defaultView: 'dashboard',
      pinnedViews: ['agents', 'tools', 'skills'],
    },
  },
  features: {
    agentDelegation: true,
    multiTenant: false,
    marketplace: true,
    analytics: true,
    plugins: true,
  },
};

/**
 * Configuration manager - handles loading, validation, and persistence
 */
export class ConfigManager {
  private config: AppConfig;
  private listeners: Map<string, ((config: AppConfig) => void)[]> = new Map();
  private loaded: boolean = false;

  constructor() {
    this.config = this.deepClone(DEFAULT_CONFIG);
  }

  /**
   * Load configuration from all sources
   */
  async load(): Promise<AppConfig> {
    // Load order: defaults -> env -> localStorage -> file
    const envConfig = this.loadFromEnv();
    const storageConfig = this.loadFromStorage();

    this.config = this.mergeConfig(
      DEFAULT_CONFIG,
      envConfig,
      storageConfig
    );

    this.loaded = true;
    this.emit('loaded', this.config);
    return this.config;
  }

  /**
   * Load from environment variables (server-side safe)
   */
  private loadFromEnv(): Partial<AppConfig> {
    const env: Partial<AppConfig> = {};

    if (typeof process === 'undefined') return env;

    // Gateway config
    if (process.env.VITE_GATEWAY_URL) {
      env.gateway = {
        ...DEFAULT_CONFIG.gateway,
        url: process.env.VITE_GATEWAY_URL,
        token: process.env.VITE_GATEWAY_TOKEN || '',
      };
    }

    // Ollama config
    if (process.env.VITE_OLLAMA_ENDPOINT) {
      env.ollama = {
        ...DEFAULT_CONFIG.ollama,
        local: {
          ...DEFAULT_CONFIG.ollama.local,
          endpoint: process.env.VITE_OLLAMA_ENDPOINT,
          defaultModel: process.env.VITE_OLLAMA_MODEL || 'gemma3',
        },
      };
    }

    // Ollama Cloud
    if (process.env.VITE_OLLAMA_CLOUD_API_KEY) {
      env.ollama = {
        ...env.ollama,
        ...DEFAULT_CONFIG.ollama,
        cloud: {
          enabled: true,
          apiKey: process.env.VITE_OLLAMA_CLOUD_API_KEY,
          endpoint: process.env.VITE_OLLAMA_CLOUD_ENDPOINT || 'https://api.ollama.com',
          defaultModel: process.env.VITE_OLLAMA_CLOUD_MODEL || 'gemma3',
        },
      };
    }

    // Provider configs
    const providers = ['OPENAI', 'ANTHROPIC', 'GROQ'];
    env.providers = {};
    for (const provider of providers) {
      const key = process.env[`VITE_${provider}_API_KEY`];
      if (key) {
        env.providers![provider.toLowerCase()] = {
          name: provider,
          enabled: true,
          apiKey: key,
          endpoint: process.env[`VITE_${provider}_ENDPOINT`],
          model: process.env[`VITE_${provider}_MODEL`],
        };
      }
    }

    // Channel configs
    if (process.env.TELEGRAM_BOT_TOKEN) {
      env.channels = {
        ...env.channels,
        telegram: {
          token: process.env.TELEGRAM_BOT_TOKEN,
        }
      };
    }

    return env;
  }

  /**
   * Load from localStorage (browser only)
   */
  private loadFromStorage(): Partial<AppConfig> {
    if (typeof localStorage === 'undefined') return {};

    try {
      const saved = localStorage.getItem('openclaw-config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      console.warn('Failed to load config from localStorage');
    }
    return {};
  }

  /**
   * Save configuration
   */
  async save(config?: Partial<AppConfig>): Promise<void> {
    if (config) {
      this.config = this.mergeConfig(this.config, config);
    }

    // Only save non-sensitive parts to localStorage
    const storable = this.sanitizeForStorage(this.config);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('openclaw-config', JSON.stringify(storable));
    }

    this.emit('saved', this.config);
  }

  /**
   * Get current configuration
   */
  get(): AppConfig {
    return this.deepClone(this.config);
  }

  /**
   * Get specific section
   */
  getSection<K extends keyof AppConfig>(section: K): AppConfig[K] {
    return this.deepClone(this.config[section]);
  }

  /**
   * Update configuration
   */
  update(updates: Partial<AppConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
    this.emit('changed', this.config);
  }

  /**
   * Set a specific value
   */
  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value;
    this.emit('changed', this.config);
  }

  /**
   * Subscribe to configuration changes
   */
  on(event: 'loaded' | 'saved' | 'changed', callback: (config: AppConfig) => void): () => void {
    const listeners = this.listeners.get(event) || [];
    listeners.push(callback);
    this.listeners.set(event, listeners);

    return () => {
      const current = this.listeners.get(event) || [];
      this.listeners.set(
        event,
        current.filter((cb) => cb !== callback)
      );
    };
  }

  /**
   * Check if configuration is valid
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check gateway
    if (!this.config.gateway.url) {
      errors.push('Gateway URL is required');
    }

    // Check Ollama if enabled
    if (this.config.ollama.enabled) {
      if (this.config.ollama.local.enabled && !this.config.ollama.local.endpoint) {
        errors.push('Ollama local endpoint is required when enabled');
      }
      if (
        this.config.ollama.cloud?.enabled &&
        !this.config.ollama.cloud.apiKey
      ) {
        errors.push('Ollama cloud API key is required when cloud is enabled');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get masked configuration (for display)
   */
  getMasked(): AppConfig {
    const masked = this.deepClone(this.config);

    // Mask sensitive fields
    const maskValue = (obj: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(obj)) {
        if (SENSITIVE_FIELDS.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
          obj[key] = value ? '********' : '';
        } else if (typeof value === 'object' && value !== null) {
          maskValue(value as Record<string, unknown>);
        }
      }
    };

    maskValue(masked as unknown as Record<string, unknown>);
    return masked;
  }

  /**
   * Export configuration (for backup)
   */
  export(): string {
    return JSON.stringify(this.sanitizeForStorage(this.config), null, 2);
  }

  /**
   * Import configuration
   */
  async import(json: string): Promise<boolean> {
    try {
      const imported = JSON.parse(json);
      this.config = this.mergeConfig(DEFAULT_CONFIG, imported);
      await this.save();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reset to defaults
   */
  async reset(): Promise<void> {
    this.config = this.deepClone(DEFAULT_CONFIG);
    await this.save();
  }

  /**
   * Check if loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Deep merge configurations
   */
  private mergeConfig<T>(base: T, ...overrides: (Partial<T> | undefined)[]): T {
    const result = this.deepClone(base);

    for (const override of overrides) {
      if (!override) continue;

      for (const [key, value] of Object.entries(override)) {
        if (
          value !== null &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          key in (result as Record<string, unknown>)
        ) {
          (result as Record<string, unknown>)[key] = this.mergeConfig(
            (result as Record<string, unknown>)[key] as Record<string, unknown>,
            value as Record<string, unknown>
          );
        } else {
          (result as Record<string, unknown>)[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Deep clone an object
   */
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Remove sensitive data before storage
   */
  private sanitizeForStorage(config: AppConfig): Partial<AppConfig> {
    const storable = this.deepClone(config);

    // Remove API keys
    if (storable.ollama?.cloud) {
      delete (storable.ollama.cloud as { apiKey?: string }).apiKey;
    }

    if (storable.providers) {
      for (const provider of Object.values(storable.providers)) {
        if (provider) {
          delete (provider as { apiKey?: string }).apiKey;
        }
      }
    }

    if (storable.channels?.telegram) {
      delete (storable.channels.telegram as { token?: string }).token;
    }

    delete (storable.gateway as { token?: string }).token;

    return storable;
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, config: AppConfig): void {
    const listeners = this.listeners.get(event) || [];
    for (const callback of listeners) {
      try {
        callback(this.deepClone(config));
      } catch (error) {
        console.error(`Config listener error:`, error);
      }
    }
  }
}

/**
 * Global config manager instance
 */
export const configManager = new ConfigManager();

/**
 * Initialize configuration
 */
export async function initConfig(): Promise<AppConfig> {
  return configManager.load();
}

/**
 * Get config manager
 */
export function getConfigManager(): ConfigManager {
  return configManager;
}

/**
 * Load configuration
 */
export async function loadConfig(): Promise<AppConfig> {
  return configManager.load();
}

/**
 * Save configuration
 */
export async function saveConfig(config: Partial<AppConfig>): Promise<void> {
  Object.entries(config).forEach(([key, value]) => {
    configManager.set(key as keyof AppConfig, value as AppConfig[keyof AppConfig]);
  });
  await configManager.save();
}

/**
 * Get configuration value
 */
export function getConfig<T>(key: string): T | undefined {
  const config = configManager.get();
  return key.split('.').reduce<unknown>((obj, k) => {
    if (obj && typeof obj === 'object' && k in obj) {
      return (obj as Record<string, unknown>)[k];
    }
    return undefined;
  }, config as unknown) as T | undefined;
}
