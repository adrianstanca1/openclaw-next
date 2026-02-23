/**
 * OpenClaw Next - Configuration Management System
 * Secure, hierarchical configuration with credential handling
 */
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
];
/**
 * Default configuration
 */
export const DEFAULT_CONFIG = {
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
    config;
    listeners = new Map();
    loaded = false;
    constructor() {
        this.config = this.deepClone(DEFAULT_CONFIG);
    }
    /**
     * Load configuration from all sources
     */
    async load() {
        // Load order: defaults -> env -> localStorage -> file
        const envConfig = this.loadFromEnv();
        const storageConfig = this.loadFromStorage();
        this.config = this.mergeConfig(DEFAULT_CONFIG, envConfig, storageConfig);
        this.loaded = true;
        this.emit('loaded', this.config);
        return this.config;
    }
    /**
     * Load from environment variables (server-side safe)
     */
    loadFromEnv() {
        const env = {};
        if (typeof process === 'undefined')
            return env;
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
                env.providers[provider.toLowerCase()] = {
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
    loadFromStorage() {
        if (typeof localStorage === 'undefined')
            return {};
        try {
            const saved = localStorage.getItem('openclaw-config');
            if (saved) {
                return JSON.parse(saved);
            }
        }
        catch {
            console.warn('Failed to load config from localStorage');
        }
        return {};
    }
    /**
     * Save configuration
     */
    async save(config) {
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
    get() {
        return this.deepClone(this.config);
    }
    /**
     * Get specific section
     */
    getSection(section) {
        return this.deepClone(this.config[section]);
    }
    /**
     * Update configuration
     */
    update(updates) {
        this.config = this.mergeConfig(this.config, updates);
        this.emit('changed', this.config);
    }
    /**
     * Set a specific value
     */
    set(key, value) {
        this.config[key] = value;
        this.emit('changed', this.config);
    }
    /**
     * Subscribe to configuration changes
     */
    on(event, callback) {
        const listeners = this.listeners.get(event) || [];
        listeners.push(callback);
        this.listeners.set(event, listeners);
        return () => {
            const current = this.listeners.get(event) || [];
            this.listeners.set(event, current.filter((cb) => cb !== callback));
        };
    }
    /**
     * Check if configuration is valid
     */
    validate() {
        const errors = [];
        // Check gateway
        if (!this.config.gateway.url) {
            errors.push('Gateway URL is required');
        }
        // Check Ollama if enabled
        if (this.config.ollama.enabled) {
            if (this.config.ollama.local.enabled && !this.config.ollama.local.endpoint) {
                errors.push('Ollama local endpoint is required when enabled');
            }
            if (this.config.ollama.cloud?.enabled &&
                !this.config.ollama.cloud.apiKey) {
                errors.push('Ollama cloud API key is required when cloud is enabled');
            }
        }
        return { valid: errors.length === 0, errors };
    }
    /**
     * Get masked configuration (for display)
     */
    getMasked() {
        const masked = this.deepClone(this.config);
        // Mask sensitive fields
        const maskValue = (obj) => {
            for (const [key, value] of Object.entries(obj)) {
                if (SENSITIVE_FIELDS.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
                    obj[key] = value ? '********' : '';
                }
                else if (typeof value === 'object' && value !== null) {
                    maskValue(value);
                }
            }
        };
        maskValue(masked);
        return masked;
    }
    /**
     * Export configuration (for backup)
     */
    export() {
        return JSON.stringify(this.sanitizeForStorage(this.config), null, 2);
    }
    /**
     * Import configuration
     */
    async import(json) {
        try {
            const imported = JSON.parse(json);
            this.config = this.mergeConfig(DEFAULT_CONFIG, imported);
            await this.save();
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Reset to defaults
     */
    async reset() {
        this.config = this.deepClone(DEFAULT_CONFIG);
        await this.save();
    }
    /**
     * Check if loaded
     */
    isLoaded() {
        return this.loaded;
    }
    /**
     * Deep merge configurations
     */
    mergeConfig(base, ...overrides) {
        const result = this.deepClone(base);
        for (const override of overrides) {
            if (!override)
                continue;
            for (const [key, value] of Object.entries(override)) {
                if (value !== null &&
                    typeof value === 'object' &&
                    !Array.isArray(value) &&
                    key in result) {
                    result[key] = this.mergeConfig(result[key], value);
                }
                else {
                    result[key] = value;
                }
            }
        }
        return result;
    }
    /**
     * Deep clone an object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    /**
     * Remove sensitive data before storage
     */
    sanitizeForStorage(config) {
        const storable = this.deepClone(config);
        // Remove API keys
        if (storable.ollama?.cloud) {
            delete storable.ollama.cloud.apiKey;
        }
        if (storable.providers) {
            for (const provider of Object.values(storable.providers)) {
                if (provider) {
                    delete provider.apiKey;
                }
            }
        }
        if (storable.channels?.telegram) {
            delete storable.channels.telegram.token;
        }
        delete storable.gateway.token;
        return storable;
    }
    /**
     * Emit event to listeners
     */
    emit(event, config) {
        const listeners = this.listeners.get(event) || [];
        for (const callback of listeners) {
            try {
                callback(this.deepClone(config));
            }
            catch (error) {
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
export async function initConfig() {
    return configManager.load();
}
/**
 * Get config manager
 */
export function getConfigManager() {
    return configManager;
}
/**
 * Load configuration
 */
export async function loadConfig() {
    return configManager.load();
}
/**
 * Save configuration
 */
export async function saveConfig(config) {
    Object.entries(config).forEach(([key, value]) => {
        configManager.set(key, value);
    });
    await configManager.save();
}
/**
 * Get configuration value
 */
export function getConfig(key) {
    const config = configManager.get();
    return key.split('.').reduce((obj, k) => {
        if (obj && typeof obj === 'object' && k in obj) {
            return obj[k];
        }
        return undefined;
    }, config);
}
