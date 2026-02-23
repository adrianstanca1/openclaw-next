/**
 * OpenClaw Next - Ollama Provider
 * Adapts local Ollama API to unified LLM interface
 */
import { ollamaClient } from '../../ollama.js';
export class OllamaProvider {
    name = 'ollama';
    constructor() {
        // Initialize Ollama client
    }
    async isAvailable() {
        try {
            const status = await ollamaClient.checkConnection();
            return status.connected;
        }
        catch {
            return false;
        }
    }
    async listModels() {
        const models = await ollamaClient.listModels();
        return models.map(m => m.name);
    }
    async chat(request) {
        // Map unified request format to Ollama specific format
        const ollamaRequest = {
            model: request.model,
            messages: request.messages.map(m => ({
                role: m.role,
                content: m.content
            })),
            stream: false, // Default to false for now, stream support later
            options: {
                temperature: request.temperature,
                top_p: request.topP,
                num_predict: request.maxTokens,
            }
        };
        const response = await ollamaClient.chat(ollamaRequest);
        // Map Ollama response to unified format
        return {
            id: Math.random().toString(36).substring(7),
            object: 'chat.completion',
            created: Date.now(),
            model: response.model,
            choices: [{
                    index: 0,
                    message: {
                        role: response.message.role,
                        content: response.message.content
                    },
                    finishReason: response.done ? 'stop' : null
                }],
            usage: {
                promptTokens: response.prompt_eval_count || 0,
                completionTokens: response.eval_count || 0,
                totalTokens: (response.prompt_eval_count || 0) + (response.eval_count || 0)
            }
        };
    }
}
