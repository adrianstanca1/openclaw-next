// OpenClaw Next - UI Types
// React UI Component Types

import type { AgentConfig, SessionState } from '../core/types.js';
import type { AgentState } from '../agents/types.js';
import type { InstalledPlugin, PluginState } from '../plugins/types.js';
import type { InstalledSkill, SkillState } from '../skills/types.js';
import type { ToolDefinition } from '../tools/types.js';

/**
 * UI Theme
 */
export type UITheme = 'dark' | 'light' | 'system';

/**
 * Navigation Item
 */
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  disabled?: boolean;
}

/**
 * Wizard Step
 */
export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  isOptional?: boolean;
}

/**
 * Setup Configuration State
 */
export interface SetupConfig {
  ollama: {
    mode: 'local' | 'cloud' | 'custom';
    localUrl: string;
    cloudUrl: string;
    customUrl: string;
  };
  apiKeys: {
    openai?: string;
    anthropic?: string;
    gemini?: string;
    groq?: string;
    custom: Array<{ name: string; key: string }>;
  };
  gateway: {
    enabled: boolean;
    port: number;
    host: string;
    authEnabled: boolean;
    authToken: string;
  };
}

/**
 * Validation Result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Connection Test Result
 */
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: {
    version?: string;
    models?: string[];
    latency?: number;
  };
}

/**
 * Dashboard Stats
 */
export interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalSessions: number;
  activeSessions: number;
  installedPlugins: number;
  enabledPlugins: number;
  installedSkills: number;
  availableTools: number;
}

/**
 * Agent Card Data
 */
export interface AgentCardData {
  config: AgentConfig;
  state?: AgentState;
  sessionCount: number;
  lastActive?: string;
  health: 'healthy' | 'warning' | 'error' | 'unknown';
}

/**
 * Plugin Card Data
 */
export interface PluginCardData {
  plugin: InstalledPlugin;
  hookCount: number;
  eventCount: number;
  dependenciesSatisfied: boolean;
}

/**
 * Skill Card Data
 */
export interface SkillCardData {
  skill: InstalledSkill;
  enabledForAgents: number;
  executionCount: number;
  lastExecution?: string;
}

/**
 * Tool Card Data
 */
export interface ToolCardData {
  tool: ToolDefinition;
  usageCount: number;
  averageExecutionTime: number;
  enabled: boolean;
}

/**
 * Modal State
 */
export interface ModalState {
  isOpen: boolean;
  type: 'create' | 'edit' | 'delete' | 'confirm' | null;
  data?: unknown;
}

/**
 * Toast Notification
 */
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

/**
 * Filter State
 */
export interface FilterState {
  search: string;
  category: string | null;
  status: string | null;
  sortBy: 'name' | 'date' | 'usage';
  sortOrder: 'asc' | 'desc';
}

/**
 * Pagination State
 */
export interface PaginationState {
  page: number;
  perPage: number;
  total: number;
}

/**
 * View State
 */
export type ViewState =
  | 'dashboard'
  | 'agents'
  | 'sessions'
  | 'tools'
  | 'plugins'
  | 'skills'
  | 'settings'
  | 'marketplace'
  | 'delegation';

/**
 * Subagent Information
 */
export interface SubagentInfo {
  id: string;
  name: string;
  role: string;
  parentAgentId: string;
  status: 'idle' | 'busy' | 'error' | 'offline';
  capabilities: string[];
  currentTask?: string;
  createdAt: string;
  lastActive?: string;
}

/**
 * Delegation Task
 */
export interface DelegationTask {
  id: string;
  fromAgent: string;
  fromAgentName: string;
  toAgent: string;
  toAgentName: string;
  task: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  priority: 'low' | 'normal' | 'high';
  progress?: number;
  createdAt: string;
  deadline?: string;
  result?: unknown;
  error?: string;
}

/**
 * Task Queue Item
 */
export interface TaskQueueItem {
  id: string;
  type: 'delegation' | 'execution' | 'analysis';
  priority: number;
  payload: unknown;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  assignedAgent?: string;
}

/**
 * System Status
 */
export interface SystemStatus {
  server: {
    state: 'stopped' | 'starting' | 'running' | 'paused' | 'error';
    uptime: number;
    version: string;
  };
  ollama: {
    connected: boolean;
    mode: 'local' | 'cloud' | 'unavailable';
    models: number;
    latency: number;
  };
  agents: {
    total: number;
    active: number;
    subagents: number;
  };
  tasks: {
    pending: number;
    active: number;
    completed: number;
    failed: number;
  };
}
