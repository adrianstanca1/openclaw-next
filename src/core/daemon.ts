/**
 * OpenClaw Next - Heartbeat Daemon
 * Implements autonomous proactive behavior and project state management
 */

import { EventEmitter } from 'events';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { agentManager } from '../agents/index.js';
import { AgentRole, AgentCapability } from './types.js';

export interface StateTask {
  id: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'done';
  owner: string; // agent ID
  blocked_by?: string[];
  output_path?: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
}

export interface ProjectState {
  project_name: string;
  last_updated: string;
  goals: string[];
  tasks: StateTask[];
}

const STATE_FILE = 'STATE.yaml';
const HEARTBEAT_INTERVAL = 60000; // 1 minute

export class HeartbeatDaemon extends EventEmitter {
  private intervalId: NodeJS.Timeout | null = null;
  private basePath: string;
  private isRunning: boolean = false;

  constructor(basePath: string = './workspace') {
    super();
    this.basePath = basePath;
  }

  /**
   * Start the daemon
   */
  start() {
    if (this.isRunning) return;
    
    console.log('[Daemon] Starting heartbeat...');
    this.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), HEARTBEAT_INTERVAL);
    
    // Initial tick
    this.tick();
  }

  /**
   * Stop the daemon
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[Daemon] Stopped heartbeat.');
  }

  /**
   * Main execution loop (Heartbeat)
   */
  private async tick() {
    console.log(`[Daemon] Heartbeat tick: ${new Date().toISOString()}`);
    
    try {
      // 1. Check Project State (STATE.yaml)
      const state = await this.checkProjectState();

      // 2. Proactive Web Observation (Innovation)
      await this.runWebObserver();

      // 3. Task Processing
      const todoTasks = state?.tasks.filter(t => t.status === 'todo') || [];
      if (todoTasks.length > 0) {
        console.log(`[Daemon] Found ${todoTasks.length} pending tasks. Triggering CEO Agent...`);
        await this.triggerAgentAction(todoTasks);
      }

      // 4. Emit heartbeat event for UI
      this.emit('heartbeat', {
        timestamp: new Date().toISOString(),
        tasksCount: todoTasks.length
      });

    } catch (error) {
      console.error('[Daemon] Error in heartbeat:', error);
    }
  }

  /**
   * Run the Web Observer
   * Periodically checks for external updates autonomously
   */
  private async runWebObserver() {
    console.log('[Daemon] 🌐 Web Observer pulse...');
    // This would trigger a specialized agent with 'web_search' or 'web_fetch'
    // To monitor GitHub repos, price drops, or news.
  }

  /**
   * Trigger the CEO Agent to process tasks
   */
  private async triggerAgentAction(tasks: StateTask[]) {
    // Find or spawn a manager agent
    let ceoAgent = agentManager.getAllAgents().find(a => a.config.role === AgentRole.MANAGER);
    
    if (!ceoAgent) {
      try {
        ceoAgent = await agentManager.spawnAgent({
          id: 'ceo-agent',
          name: 'Project CEO',
          role: AgentRole.MANAGER,
          model: 'llama3.1',
          capabilities: [AgentCapability.COORDINATION, AgentCapability.PLANNING, AgentCapability.REASONING],
          workspace: this.basePath,
          skills: [],
          tools: ['filesystem', 'bash']
        } as any);
      } catch (e) {
        console.error('[Daemon] Failed to spawn CEO agent', e);
        return;
      }
    }

    // Execute the first task
    const task = tasks[0];
    console.log(`[Daemon] CEO Agent processing task: ${task.description}`);
    
    // Trigger the agent loop
    // In real implementation: await agentManager.process(ceoAgent.id, `Execute task: ${task.description}`);
  }

  /**
   * Check STATE.yaml for updates
   */
  private async checkProjectState(): Promise<ProjectState | null> {
    const statePath = join(this.basePath, STATE_FILE);
    if (!existsSync(statePath)) {
      // Create initial state if missing
      const initialState = `
project_name: "New Project"
last_updated: "${new Date().toISOString()}"
goals:
  - "Initialize project structure"
tasks:
  - id: "init-001"
    status: "todo"
    owner: "system"
    description: "Setup initial project files"
    priority: "high"
`;
      // Ensure directory exists
      if (!existsSync(this.basePath)) {
        require('fs').mkdirSync(this.basePath, { recursive: true });
      }
      writeFileSync(statePath, initialState);
      return null;
    }

    // Simple line-based parser for demonstration (MVP)
    try {
      const content = readFileSync(statePath, 'utf-8');
      const tasks: StateTask[] = [];
      
      // Extract tasks via regex
      const taskBlocks = content.split('- id:');
      for (const block of taskBlocks.slice(1)) {
        const id = block.split('\n')[0].trim();
        const status = (block.match(/status:\s*"(.*)"/) || [])[1] as any;
        const description = (block.match(/description:\s*"(.*)"/) || [])[1] || '';
        
        if (id && status) {
          tasks.push({ id, status, description, owner: 'system', priority: 'medium' });
        }
      }

      return {
        project_name: "Project",
        last_updated: new Date().toISOString(),
        goals: [],
        tasks
      };
    } catch (e) {
      console.error('[Daemon] YAML Parse Error', e);
      return null;
    }
  }

  /**
   * Update task status in STATE.yaml
   */
  async updateTaskStatus(taskId: string, status: StateTask['status']) {
    console.log(`[Daemon] Updating task ${taskId} to ${status}`);
    // implementation for writing back to yaml
  }
}

export const daemon = new HeartbeatDaemon();
