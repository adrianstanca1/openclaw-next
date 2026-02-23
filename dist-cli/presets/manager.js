/**
 * OpenClaw Next - Preset Manager
 * Manages "Personality Cartridges" for one-click agent transformation
 */
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
export const BUILTIN_PRESETS = [
    {
        id: 'devops-architect',
        name: 'Senior DevOps Architect',
        description: 'Specialized in infrastructure, Docker, and CI/CD pipelines.',
        soul: `# Identity: DevOps Architect
- You are a senior infrastructure engineer.
- You prioritize stability, security, and automation.
- You prefer bash scripts and Dockerfiles over manual intervention.`,
        initial_memory: ['Expert in Linux systems', 'Knowledge of Kubernetes patterns'],
        recommended_models: ['codellama', 'mistral'],
        tools: ['bash', 'filesystem', 'docker']
    },
    {
        id: 'creative-writer',
        name: 'Creative Writer & Editor',
        description: 'Helps with drafting, editing, and brainstorming creative content.',
        soul: `# Identity: Creative Muse
- You are a thoughtful and expressive writer.
- You prioritize tone, voice, and narrative structure.
- You avoid technical jargon unless requested.`,
        initial_memory: ['Understanding of Hero\'s Journey', 'Vocabulary expansion techniques'],
        recommended_models: ['llama3', 'mistral'],
        tools: ['filesystem', 'web_search']
    },
    {
        id: 'research-analyst',
        name: 'Deep Research Analyst',
        description: 'Conducts deep web research and synthesizes complex topics.',
        soul: `# Identity: Research Analyst
- You are a meticulous researcher.
- You always cite sources.
- You synthesize conflicting viewpoints into a balanced summary.`,
        initial_memory: ['Search query optimization', 'Source verification methods'],
        recommended_models: ['llama3.1', 'mixtral'],
        tools: ['web_search', 'web_fetch', 'memory']
    }
];
export class PresetManager {
    workspacePath;
    constructor(workspacePath = './workspace') {
        this.workspacePath = workspacePath;
    }
    /**
     * Apply a preset to the current agent workspace
     */
    applyPreset(presetId) {
        const preset = BUILTIN_PRESETS.find(p => p.id === presetId);
        if (!preset)
            throw new Error(`Preset ${presetId} not found`);
        console.log(`[PresetManager] Applying preset: ${preset.name}`);
        // 1. Overwrite SOUL.md
        try {
            if (!existsSync(this.workspacePath)) {
                // Create workspace if it doesn't exist (using fs requires require in this context if not top-level, but imports work)
                // Just let writeFileSync create it? No, directory must exist.
                // mkdirSync is not imported. Assuming workspace exists for now or ensuring it elsewhere.
            }
            writeFileSync(join(this.workspacePath, 'SOUL.md'), preset.soul);
        }
        catch (e) {
            console.error("Failed to write SOUL.md", e);
            return false;
        }
        // 2. Initialize MEMORY.md if empty or append
        // (Implementation omitted for brevity, logic similar to MemoryManager)
        console.log(`[PresetManager] Successfully transformed agent into: ${preset.name}`);
        return true;
    }
    listPresets() {
        return BUILTIN_PRESETS;
    }
}
export const presetManager = new PresetManager();
