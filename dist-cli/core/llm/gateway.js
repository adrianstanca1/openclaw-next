/**
 * OpenClaw Next - Enhanced Model Gateway
 * Optimized for local-first execution and cost minimization
 */
import { OllamaProvider } from './providers/ollama.js';
import { OpenAIProvider } from './providers/openai.js';
import { AnthropicProvider } from './providers/anthropic.js';
export class ModelGateway {
    providers = new Map();
    localProvider = 'ollama';
    forceLocal = true; // Priority: Local use
    constructor() {
        this.registerProvider('ollama', new OllamaProvider());
        this.registerProvider('openai', new OpenAIProvider());
        this.registerProvider('anthropic', new AnthropicProvider());
    }
    registerProvider(name, provider) {
        this.providers.set(name, provider);
    }
    /**
     * Enhanced chat with complexity routing
     */
    async chat(request) {
        const complexity = this.analyzeComplexity(request);
        const optimalProvider = this.getOptimalProvider(complexity, request.model);
        console.log(`[Gateway] Routing task (Complexity: ${complexity}) to ${optimalProvider}`);
        const provider = this.providers.get(optimalProvider);
        if (!provider || !(await provider.isAvailable())) {
            // Automatic fallback to local
            return this.providers.get(this.localProvider).chat(request);
        }
        return provider.chat(request);
    }
    /**
     * Analyze task complexity to determine the cheapest viable model
     */
    analyzeComplexity(request) {
        const content = request.messages.map(m => m.content).join(' ').toLowerCase();
        // High complexity: Coding, Architecture, Deep Research
        if (content.includes('refactor') || content.includes('architect') || content.includes('debug complex')) {
            return 'high';
        }
        // Medium complexity: Reasoning, Tool use, Multi-step plans
        if (content.includes('plan') || content.includes('analyze') || request.tools) {
            return 'medium';
        }
        // Low complexity: Summarization, Chat, Greeting, Fact retrieval
        return 'low';
    }
    /**
     * Selection logic: Prioritize local models unless high complexity is detected
     * and cloud providers are enabled.
     */
    getOptimalProvider(complexity, requestedModel) {
        if (this.forceLocal)
            return this.localProvider;
        if (complexity === 'high' && !requestedModel.includes('llama')) {
            return 'anthropic'; // Or openai
        }
        return this.localProvider;
    }
    /**
     * Set 'forceLocal' to true to ensure 0 cost during development
     */
    setLocalPriority(enabled) {
        this.forceLocal = enabled;
    }
}
export const modelGateway = new ModelGateway();
