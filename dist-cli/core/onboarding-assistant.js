/**
 * OpenClaw Next - Enhanced Onboarding Assistant
 * Implements requirement analysis and strategic configuration planning.
 */
import { modelGateway } from './llm/gateway.js';
export class OnboardingAssistant {
    setupSoul = `
You are the OpenClaw Strategy Architect.
Your goal is to design the perfect agent setup for a user based on their needs.
Don't ask for every key—only the ones essential for their specific mission.
Always prioritize local models (Ollama) to save the user money.
Explain your choices simply.
  `;
    /**
     * Phase 1: Analyze user requirements and propose a setup scheme
     */
    async proposeScheme(userGoal) {
        const prompt = `
User Goal: "${userGoal}"
Propose a minimal, efficient setup scheme. 
Respond in JSON format:
{
  "mission": "short name",
  "recommendedArchitecture": "explanation",
  "requiredKeys": ["list of provider names like 'openai' or 'anthropic'"],
  "suggestedLocalModels": ["llama3.2", "nomic-embed-text"],
  "capabilitiesToEnable": ["web_search", "coding"]
}
    `;
        const response = await modelGateway.chat({
            model: 'llama3.2',
            messages: [
                { role: 'system', content: this.setupSoul },
                { role: 'user', content: prompt }
            ],
            temperature: 0.2 // High precision for JSON
        });
        try {
            return JSON.parse(response.choices[0].message.content);
        }
        catch (e) {
            // Fallback for non-json responses
            return {
                mission: "General Assistant",
                recommendedArchitecture: "Standard local-first setup using Ollama.",
                requiredKeys: [],
                suggestedLocalModels: ["llama3.2"],
                capabilitiesToEnable: ["files", "shell"]
            };
        }
    }
    /**
     * Phase 2: Specific request for a credential
     */
    async getCredentialRequest(keyName) {
        const descriptions = {
            openai: "I need an OpenAI API key to handle high-complexity reasoning that local models might struggle with. You can get one at platform.openai.com.",
            anthropic: "To give your agent 'Human-like' nuance in writing, an Anthropic key is best. It provides access to the Claude models.",
            tavily: "For real-time web search, I recommend a Tavily key. It allows me to browse the internet for you."
        };
        return descriptions[keyName.toLowerCase()] || `Please provide the access key for ${keyName}.`;
    }
}
export const onboardingAssistant = new OnboardingAssistant();
