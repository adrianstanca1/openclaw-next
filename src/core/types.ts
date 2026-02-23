// OpenClaw Next - Core Types
// Superintelligence Platform for Agentic Gateways

/**
 * Agent Configuration
 */
export interface AgentConfig {
  id: string;
  name: string;
  model: string;
  role: AgentRole;
  capabilities: AgentCapability[];
  personality?: AgentPersonality;
  workspace: string;
  skills: string[];
  tools: AgentToolConfig[];
  heartbeat?: HeartbeatConfig;
  subagents?: SubagentConfig[];
  groupChat?: GroupChatConfig;
  createdAt?: string;
}

/**
 * Agent Roles
 */
export enum AgentRole {
  OPERATOR = 'operator',
  DEVELOPER = 'developer',
  ANALYST = 'analyst',
  MANAGER = 'manager',
  CREATOR = 'creator',
  ADMIN = 'admin',
}

/**
 * Agent Capabilities
 */
export enum AgentCapability {
  REASONING = 'reasoning',
  TOOL_USE = 'tool_use',
  MEMORY = 'memory',
  PLANNING = 'planning',
  LEARNING = 'learning',
  COMMUNICATION = 'communication',
  COORDINATION = 'coordination',
  AUTONOMY = 'autonomy',
}

/**
 * Agent Personality Profile
 */
export interface AgentPersonality {
  tone: 'professional' | 'casual' | 'creative' | 'analytical';
  style: 'concise' | 'detailed' | 'step-by-step' | 'questioning';
  bias: 'balanced' | 'optimistic' | 'critical' | 'pragmatic';
  collaboration: 'independent' | 'collaborative' | 'supervisory';
}

/**
 * Tool Configuration
 */
export interface AgentToolConfig {
  name: string;
  enabled: boolean;
  parameters?: Record<string, unknown>;
  restrictions?: ToolRestrictions;
}

export interface ToolRestrictions {
  maxCallsPerHour?: number;
  costLimit?: number;
  allowedModes?: string[];
  approvalRequired?: boolean;
}

/**
 * Heartbeat Configuration
 */
export interface HeartbeatConfig {
  enabled: boolean;
  interval: string; // e.g., "30m", "1h"
  taskList: string[];
  autoRespond: boolean;
  responseTemplate: string;
  visibility: {
    webchat: boolean;
    mobile: boolean;
    desktop: boolean;
  };
}

/**
 * Subagent Configuration
 */
export interface SubagentConfig {
  agentId: string;
  role: string;
  authority: 'fully_autonomous' | 'requires_approval' | 'supervised';
  priority: 'high' | 'medium' | 'low';
  collaborationMode: 'parallel' | 'sequential' | 'hierarchical';
}

/**
 * Group Chat Configuration
 */
export interface GroupChatConfig {
  enabled: boolean;
  participants: string[];
  coordinator: string;
  rules: GroupChatRule[];
}

export interface GroupChatRule {
  type: '发言间隔' | '角色轮换' | '共识达成' | '紧急中断';
  parameters: Record<string, unknown>;
}

/**
 * Skill Configuration
 */
export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  provider: string;
  version: string;
  enabled: boolean;
  requires: string[];
  apiKeys: string[];
  permissions: string[];
}

/**
 * Tool Execution Result
 */
export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  durationMs: number;
  metadata: ToolMetadata;
}

export interface ToolMetadata {
  toolName?: string;
  agentId?: string;
  sessionId?: string;
  timestamp?: string;
  cost?: number;
  // Extended properties for tool definitions
  id?: string;
  name?: string;
  description?: string;
  version?: string;
  type?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Gateway Connection Status
 */
export interface GatewayStatus {
  connected: boolean;
  version: string;
  uptime: number;
  activeSessions: number;
  activeAgents: number;
  channels: ChannelStatus[];
  systemLoad: SystemLoad;
}

export interface ChannelStatus {
  id: string;
  name: string;
  connected: boolean;
  activeConversations: number;
  lastMessage: string | null;
}

export interface SystemLoad {
  cpu: number;
  memory: number;
  network: number;
}

/**
 * Session State
 */
export interface SessionState {
  id: string;
  agentId: string;
  channel: string;
  participants: string[];
  context: SessionContext;
  history: Message[];
  activeTools: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionContext {
  workspace: string;
  memory: MemorySnapshot;
  state: Record<string, unknown>;
}

export interface MemorySnapshot {
  shortTerm: string[];
  longTerm: KnowledgeBaseEntry[];
}

export interface KnowledgeBaseEntry {
  id: string;
  content: string;
  tags: string[];
  lastAccessed: string;
  usageCount: number;
}

/**
 * Message Structure
 */
export interface Message {
  id: string;
  sender: 'user' | 'agent' | 'system' | 'tool';
  content: string;
  type: 'text' | 'tool' | 'image' | 'command';
  timestamp: string;
  toolCalls?: ToolCall[];
  attachments?: Attachment[];
}

export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, unknown>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'file';
  url: string;
  name: string;
  size: number;
}

/**
 * Activity Log Entry
 */
export interface ActivityLog {
  id: string;
  type: ActivityType;
  timestamp: string;
  details: ActivityDetails;
  agentId?: string;
  sessionId?: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export type ActivityType =
  | 'agent_spawned'
  | 'agent_terminated'
  | 'message_sent'
  | 'message_received'
  | 'tool_executed'
  | 'skill_triggered'
  | 'heartbeat'
  | 'error'
  | 'config_changed'
  | 'session_created'
  | 'session_ended';

export interface ActivityDetails {
  message?: string;
  metadata?: Record<string, unknown>;
  context?: string;
}

/**
 * Analytics Metrics
 */
export interface AnalyticsMetrics {
  totalSessions: number;
  totalMessages: number;
  totalToolsExecuted: number;
  totalCost: number;
  averageResponseTime: number;
  successRate: number;
  peakConcurrentSessions: number;
  hourlyDistribution: HourlyMetrics[];
}

export interface HourlyMetrics {
  hour: string;
  sessions: number;
  messages: number;
  tools: number;
  cost: number;
}

/**
 * Plugin Interface
 */
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  hooks: PluginHook[];
  configSchema?: Record<string, unknown>;
}

export interface PluginHook {
  name: string;
  trigger: PluginTrigger;
  handler: string;
  priority: number;
}

export type PluginTrigger =
  | 'gateway_start'
  | 'gateway_stop'
  | 'agent_spawned'
  | 'agent_ended'
  | 'message_received'
  | 'message_sent'
  | 'tool_executed'
  | 'error_occurred'
  | 'session_created'
  | 'session_ended';

/**
 * Workflow Definition
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggers: WorkflowTrigger[];
  steps: WorkflowStep[];
  options: WorkflowOptions;
}

export interface WorkflowTrigger {
  type: 'scheduled' | 'event' | 'manual';
  parameters: Record<string, unknown>;
}

export interface WorkflowStep {
  id: string;
  type: 'agent' | 'tool' | 'condition' | 'delay' | 'parallel';
  config: Record<string, unknown>;
  next?: string[];
}

export interface WorkflowOptions {
  continueOnFailure: boolean;
  maxRetries: number;
  timeout: string;
  notifyOnComplete: boolean;
}

/**
 * Execution Options
 */
export interface ExecutionOptions {
  maxSteps?: number;
  timeout?: number;
  allowDelegations?: boolean;
  requireApprovals?: boolean;
  verbose?: boolean;
}

/**
 * Marketplace Skill
 */
export interface MarketplaceSkill {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  author: string;
  version: string;
  downloads: number;
  rating: number;
  reviews: number;
  requires: string[];
  license: string;
  repository: string;
  documentation: string;
  installation: {
    command: string;
    dependencies: string[];
  };
}

/**
 * Real-time Events
 */
export interface GatewayEvent {
  type: GatewayEventType;
  timestamp: string;
  data: unknown;
}

export type GatewayEventType =
  | 'agent_state_changed'
  | 'session_message'
  | 'tool_progress'
  | 'heartbeat_pulse'
  | 'system_health'
  | 'error'
  | 'config_changed'
  | 'plugin_loaded'
  | 'skill_installed';
