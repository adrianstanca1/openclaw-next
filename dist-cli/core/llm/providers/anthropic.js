/**
 * OpenClaw Next - Anthropic Provider
 * Placeholder for Anthropic API integration
 */
export class AnthropicProvider {
    name = 'anthropic';
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async isAvailable() {
        return !!this.apiKey;
    }
    async listModels() {
        return ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'];
    }
    async chat(request) {
        if (!this.apiKey)
            throw new Error('Anthropic API key not configured');
        // In a real implementation, we would use 'anthropic' package or fetch
        // const response = await fetch('https://api.anthropic.com/v1/messages', ...);
        throw new Error('Anthropic Provider not yet implemented');
    }
}
