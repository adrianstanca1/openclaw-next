/**
 * OpenClaw Next - Neural Task Analyst
 * Analyzes goals and maps them to required tools and skills.
 */
import { modelGateway } from './llm/gateway.js';
import { skillRegistry } from '../agents/skills.js';
export class TaskAnalyst {
    /**
     * Perform deep analysis of a task to identify required capabilities
     */
    async analyze(userRequest) {
        const availableTools = skillRegistry.list().map((s) => s.id);
        const prompt = `
Task: "${userRequest}"
Available System Skills: ${availableTools.join(', ')}

Analyze the task above. Identify the final goal and every technical capability required to achieve it.
If a capability is NOT in the list of Available System Skills, mark it as "missing".

Respond in JSON:
{
  "finalGoal": "The ultimate outcome",
  "strategy": ["step 1", "step 2"],
  "requiredCapabilities": [
    { "name": "skill_id", "reason": "why", "type": "skill", "status": "available|missing" }
  ],
  "complexity": "high"
}
    `;
        const response = await modelGateway.chat({
            model: 'llama3.1', // Use reasoning model
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1
        });
        try {
            const analysis = JSON.parse(response.choices[0].message.content);
            return analysis;
        }
        catch (e) {
            return {
                finalGoal: userRequest,
                strategy: ["Execute task directly"],
                requiredCapabilities: [],
                complexity: 'low'
            };
        }
    }
}
export const taskAnalyst = new TaskAnalyst();
