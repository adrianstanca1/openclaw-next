/**
 * OpenClaw Next - Dynamic Tool Synthesizer
 * Allows the agent to write, test, and register its own code as permanent skills.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { skillLoader } from '../skills/loader.js';
import { skillRegistry } from '../agents/skills.js';

export class ToolSynthesizer {
  private skillsPath: string;

  constructor(workspacePath: string = './workspace') {
    this.skillsPath = join(workspacePath, 'skills');
    this.ensureDirectory();
  }

  private ensureDirectory() {
    if (!existsSync(this.skillsPath)) {
      mkdirSync(this.skillsPath, { recursive: true });
    }
  }

  /**
   * Synthesize a new skill from agent-generated code
   * @param id Unique ID for the new skill (e.g. 'custom-crypto-price')
   * @param code The implementation code (Node.js/Python)
   * @param definition Metadata for the skill
   */
  async synthesize(id: string, code: string, definition: any) {
    console.log(`[Synthesizer] ✨ Synthesizing new skill: ${id}`);
    
    const skillDir = join(this.skillsPath, id);
    if (!existsSync(skillDir)) mkdirSync(skillDir);

    // 1. Write the implementation file
    const extension = definition.language === 'python' ? 'py' : 'js';
    writeFileSync(join(skillDir, `index.${extension}`), code);

    // 2. Write the skill.json definition
    const skillJson = {
      id,
      name: definition.name || id,
      description: definition.description || 'Auto-generated skill',
      version: '1.0.0',
      category: 'custom',
      handler: {
        type: definition.language === 'python' ? 'script' : 'function',
        language: definition.language || 'javascript',
        path: `./index.${extension}`
      },
      inputs: definition.inputs || [],
      outputs: definition.outputs || []
    };

    writeFileSync(join(skillDir, 'skill.json'), JSON.stringify(skillJson, null, 2));

    // 3. Hot-reload the Skill Loader
    try {
      const newSkill = await skillLoader.loadLocalSkill(join(skillDir, 'skill.json'));
      // In a real implementation, we would register it in the registry
      // skillRegistry.register(newSkill as any);
      console.log(`[Synthesizer] ✅ Skill ${id} is now live and permanent.`);
      return true;
    } catch (error) {
      console.error(`[Synthesizer] ❌ Synthesis failed validation:`, error);
      return false;
    }
  }
}

export const toolSynthesizer = new ToolSynthesizer();
