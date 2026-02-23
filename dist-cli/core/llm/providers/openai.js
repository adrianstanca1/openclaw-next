/**
 * OpenClaw Next - OpenAI Provider
 * Placeholder for OpenAI API integration
 */
export class OpenAIProvider {
    name = 'openai';
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async isAvailable() {
        return !!this.apiKey;
    }
    async listModels() {
        return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    }
    async chat(request) {
        if (!this.apiKey)
            throw new Error('OpenAI API key not configured');
        // In a real implementation, we would use 'openai' package or fetch
        // const response = await fetch('https://api.openai.com/v1/chat/completions', ...);
        throw new Error('OpenAI Provider not yet implemented');
    }
}
