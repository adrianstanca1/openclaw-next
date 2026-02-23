/**
 * OpenClaw Next - Neural Skill Refiner
 * Allows the agent to improve existing skills based on execution history.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { modelGateway } from '../core/llm/gateway.js';
export class SkillRefiner {
    skillsPath = './workspace/skills';
    /**
     * Refine an existing skill based on feedback
     */
    async refine(skillId, feedback) {
        const skillDir = join(this.skillsPath, skillId);
        const codePath = join(skillDir, 'index.js');
        if (!existsSync(codePath)) {
            console.error(`[Refiner] Skill ${skillId} source not found at ${codePath}`);
            return false;
        }
        const currentCode = readFileSync(codePath, 'utf-8');
        console.log(`[Refiner] 🧠 Analyzing improvements for ${skillId}...`);
        const prompt = `
Skill: ${skillId}
Feedback/Error: "${feedback}"

Current Code:
${currentCode}

Task: Rewrite the code to be more efficient, robust, and handle the error mentioned above. 
Keep the same interface. Return ONLY the code block.
    `;
        const response = await modelGateway.chat({
            model: 'llama3.1',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2
        });
        const newCode = this.extractCode(response.choices[0].message.content);
        if (newCode) {
            writeFileSync(codePath, newCode);
            console.log(`[Refiner] ✅ Skill ${skillId} has been autonomously improved.`);
            return true;
        }
        return false;
    }
    extractCode(text) {
        // Simple extraction logic
        if (text.includes('```')) {
            const parts = text.split('```');
            // Usually the second part is the code
            if (parts.length >= 3) {
                return parts[1].replace(/^(javascript|js|typescript|ts)/, '').trim();
            }
        }
        return text.trim();
    }
}
export const skillRefiner = new SkillRefiner();
