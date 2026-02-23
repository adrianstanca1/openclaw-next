import { AgentManager } from './manager.js';
import { AgentExecutor } from './executor.js';

/**
 * Global agent system initialization
 */
export const agentManager = new AgentManager();
export const agentExecutor = new AgentExecutor(agentManager);

// Link the two systems
agentManager.setExecutor(agentExecutor);

export * from './types.js';
export { AgentManager, AgentExecutor };
