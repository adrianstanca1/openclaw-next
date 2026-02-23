// OpenClaw Next - Agents Module Types
// Superintelligence Agentic Gateway System

import type { ToolResult, ActivityLog, AgentConfig, AgentRole, AgentCapability } from '../core/types.js';
export type { AgentConfig, AgentRole, AgentCapability } from '../core/types.js';

// Type exports to ensure they're marked as used
type _AgentRole = AgentRole;
type _AgentCapability = AgentCapability;
void 0 as unknown as { _role: _AgentRole; _cap: _AgentCapability };

/**
 * Agent State Enumeration
 * Represents all possible states in an agent's lifecycle
 */
export enum AgentState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  THINKING = 'thinking',
  ACTING = 'acting',
  OBSERVING = 'observing',
  WAITING = 'waiting',
  FINISHED = 'finished',
  ERROR = 'error',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended',
}

/**
 * Reasoning Step Types
 * Represents different stages of an agent's thought process
 */
export type ReasoningStepType =
  | 'plan'
  | 'analysis'
  | 'synthesis'
  | 'reflection'
  | 'decision'
  | 'execution'
  | 'observation'
  | 'learning'
  | 'delegation';

/**
 * Individual Reasoning Step
 * Captures the agent's internal thought process
 */
export interface ReasoningStep {
  id: string;
  type: ReasoningStepType;
  timestamp: string;
  content: string;
  metadata?: ReasoningMetadata;
  confidence?: number;
  children?: ReasoningStep[];
  parent?: string;
}

export interface ReasoningMetadata {
  context?: string[];
  alternativesConsidered?: string[];
  keyInsights?: string[];
  assumptions?: string[];
  uncertainty?: number;
  memoryCount?: number;
  objectives?: string[];
  confidence?: number;
  actionId?: string;
  constraints?: RunConstraints;
  alternatives?: string[];
  outcome?: string;
  lessons?: string[];
}

export interface ExecutionOptions {
  timeout?: number;
  maxSteps?: number;
  requireApproval?: boolean;
  streamOutput?: boolean;
}

export interface RunMetadata {
  version?: string;
  tags?: string[];
  custom?: Record<string, unknown>;
  startTime?: number;
  options?: ExecutionOptions;
  parentRunId?: string;
}

/**
 * Agent Run - A single execution session
 * Represents one complete interaction loop of an agent
 */
export interface AgentRun {
  id: string;
  agentId: string;
  sessionId: string;
  state: AgentState;
  startTimestamp: string;
  endTimestamp?: string;
  durationMs?: number;
  input: RunInput;
  output?: RunOutput;
  reasoningTrace: ReasoningStep[];
  actions: AgentAction[];
  observations: Observation[];
  memoriesCreated: string[];
  toolsUsed: string[];
  skillsUsed: string[];
  metadata: RunMetadata;
}

export interface RunInput {
  message: string;
  context?: RunContext;
  constraints?: RunConstraints;
  objectives?: string[];
}

export interface RunContext {
  workspace: string;
  memorySnapshot: MemorySnapshot;
  previousRunId?: string;
  delegationFrom?: string;
  groupChat?: GroupChatContext;
}

export interface RunConstraints {
  maxSteps?: number;
  timeLimitMs?: number;
  toolBudget?: number;
  approvalRequired?: boolean[];
}

export interface RunOutput {
  response: string;
  plan?: Plan;
  nextSteps?: AgentAction[];
  completed: boolean;
  success: boolean;
  error?: string;
}

export interface Plan {
  id: string;
  steps: PlanStep[];
  currentStep?: number;
  status: 'planned' | 'executing' | 'completed' | 'aborted';
}

export interface PlanStep {
  id: string;
  description: string;
  action: AgentActionType;
  dependsOn?: string[];
  completed: boolean;
}

export interface Observation {
  id: string;
  timestamp: string;
  source: 'environment' | 'tool' | 'agent' | 'user';
  content: string;
  parsed?: Record<string, unknown>;
}

/**
 * Agent Action Types
 */
export type AgentActionType =
  | 'message'
  | 'tool_call'
  | 'skill_call'
  | 'delegation'
  | 'memory_store'
  | 'memory_retrieve'
  | 'plan_create'
  | 'plan_update'
  | 'reflection'
  | 'learning'
  | 'sleep'
  | 'wait_for_input';

export interface AgentAction {
  id: string;
  type: AgentActionType;
  timestamp: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  details: ActionDetails;
  result?: unknown;
  error?: string;
}

export interface ActionDetails {
  name?: string;
  input?: Record<string, unknown>;
  targetAgentId?: string;
  memoryKey?: string;
  toolName?: string;
  skillName?: string;
  duration?: number;
  priority?: 'low' | 'normal' | 'high';
  requiresApproval?: boolean;
}

/**
 * Agent Execution Result
 * Returned after an agent completes a run
 */
export interface AgentExecutionResult {
  success: boolean;
  output?: RunOutput;
  finalState: AgentState;
  stats: ExecutionStats;
  artifacts: ExecutionArtifact[];
}

export interface ExecutionStats {
  totalSteps: number;
  totalActions: number;
  totalReasoningSteps: number;
  totalToolsUsed: number;
  totalSkillsUsed: number;
  totalMemoryEntries: number;
  totalTimeMs: number;
  averageStepTimeMs: number;
  errorCount: number;
  approvalRequests: number;
  approvalRate: number;
}

export interface ExecutionArtifact {
  id: string;
  type: 'memory' | 'plan' | 'output' | 'log';
  content: string;
  metadata: Record<string, unknown>;
}

/**
 * Agent Group and Collaboration Types
 */
export interface AgentGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
  coordinator?: string;
  rules: GroupRule[];
  sharedMemory: boolean;
  consensusRequired: boolean;
}

export interface GroupRule {
  type: '发言间隔' | '角色轮换' | '共识达成' | '紧急中断' | '轮流发言';
  parameters: Record<string, unknown>;
}

export interface GroupChatContext {
  groupId: string;
  participants: string[];
  currentSpeaker?: string;
  conversationHistory: string[];
  consensusState?: 'none' | 'partial' | 'full';
}

export interface DelegationRequest {
  id: string;
  fromAgent: string;
  toAgent: string;
  task: string;
  input: string;
  context: Record<string, unknown>;
  deadline?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  requiresApproval: boolean;
}

/**
 * Memory Types for Agent Long-term Storage
 */
export interface MemoryEntry {
  id: string;
  content: string;
  embedding?: number[];
  tags: string[];
  metadata: MemoryMetadata;
  createdAt: string;
  lastAccessed: string;
  usageCount: number;
  relevanceScore?: number;
}

export interface MemoryMetadata {
  source: 'user' | 'agent' | 'tool' | 'skill' | 'environment';
  context: string[];
  confidence?: number;
  importance: number;
  expirable?: boolean;
  expiresAt?: string;
  linkedMemories?: string[];
}

export interface MemorySnapshot {
  shortTerm: MemoryEntry[];
  longTerm: MemoryEntry[];
  working: MemoryEntry[];
}

/**
 * Skill Execution Types
 */
export interface SkillInvocation {
  id: string;
  skillId: string;
  methodName: string;
  parameters: Record<string, unknown>;
  result?: unknown;
  error?: string;
  durationMs: number;
  timestamp: string;
}

export interface SkillSchema {
  id: string;
  name: string;
  description: string;
  methods: SkillMethod[];
  requires: string[];
  permissions: string[];
}

export interface SkillMethod {
  name: string;
  description: string;
  parameters: Record<string, SkillParameter>;
  returns: unknown;
}

export interface SkillParameter {
  type: string;
  description: string;
  required: boolean;
  defaultValue?: unknown;
}

/**
 * Tool Execution Types
 */
export interface ToolInvocation {
  id: string;
  toolName: string;
  parameters: Record<string, unknown>;
  result?: ToolResult;
  error?: string;
  durationMs: number;
  timestamp: string;
  requiresApproval: boolean;
  approved: boolean;
}

export interface ToolRegistry {
  [toolName: string]: ToolDefinition;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
  returns: unknown;
  category: string;
  requiresApproval: boolean;
  rateLimit?: RateLimitConfig;
  cost?: number;
}

export interface ToolParameter {
  type: string;
  description: string;
  required: boolean;
  enum?: string[];
  defaultValue?: unknown;
  validation?: ToolValidation;
}

export interface ToolValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  requiredIf?: string;
}

export interface RateLimitConfig {
  maxCallsPerWindow: number;
  windowMs: number;
  coolDownMs?: number;
}

/**
 * Agent Manager Types
 */
export interface AgentManagerOptions {
  maxAgents: number;
  defaultTimeoutMs: number;
  autoSpawn: boolean;
  heartbeatEnabled: boolean;
  maxRetries: number;
  retryDelayMs: number;
}

export interface AgentInstance {
  id: string;
  config: AgentConfig;
  state: AgentState;
  currentRunId?: string;
  lastHeartbeat?: string;
  uptimeMs: number;
  runsCompleted: number;
  toolsUsed: Set<string>;
  skillsUsed: Set<string>;
}

export interface AgentHealth {
  id: string;
  state: AgentState;
  lastActive: string;
  runsCompleted: number;
  errorCount: number;
  avgResponseTimeMs: number;
  memoryUsage: number;
  cpuUsage: number;
}

/**
 * Logging and Monitoring Types
 */
export interface AgentLogEntry extends ActivityLog {
  agentId: string;
  runId?: string;
  sessionId?: string;
  context: LogContext;
}

export interface LogContext {
  step?: string;
  action?: string;
  memoryAccess?: string;
  toolUsed?: string;
  skillUsed?: string;
}

export interface AgentMetrics {
  totalAgentsSpawned: number;
  totalAgentsTerminated: number;
  activeAgents: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalToolsExecuted: number;
  totalSkillsInvoked: number;
  averageRunDurationMs: number;
  errorRate: number;
  memoryEntries: number;
  approvalRate: number;
}

/**
 * Batch Operations
 */
export interface AgentBatchOperation {
  type: 'spawn' | 'terminate' | 'suspend' | 'resume' | 'update';
  agents: string[];
  config?: Partial<AgentConfig>;
}

/**
 * Utility Types
 */
export type AgentEvent =
  | AgentSpawnedEvent
  | AgentTerminatedEvent
  | AgentStateChangedEvent
  | AgentRunStartedEvent
  | AgentRunCompletedEvent
  | AgentHeartbeatEvent
  | AgentErrorEvent
  | DelegationReceivedEvent;

export interface AgentSpawnedEvent {
  type: 'agent_spawned';
  timestamp: string;
  agentId: string;
  config: AgentConfig;
}

export interface AgentTerminatedEvent {
  type: 'agent_terminated';
  timestamp: string;
  agentId: string;
  reason: string;
}

export interface AgentStateChangedEvent {
  type: 'agent_state_changed';
  timestamp: string;
  agentId: string;
  oldState: AgentState;
  newState: AgentState;
}

export interface AgentRunStartedEvent {
  type: 'agent_run_started';
  timestamp: string;
  agentId: string;
  runId: string;
  input: RunInput;
}

export interface AgentRunCompletedEvent {
  type: 'agent_run_completed';
  timestamp: string;
  agentId: string;
  runId: string;
  result: AgentExecutionResult;
}

export interface AgentHeartbeatEvent {
  type: 'agent_heartbeat';
  timestamp: string;
  agentId: string;
  data: Record<string, unknown>;
}

export interface AgentErrorEvent {
  type: 'agent_error';
  timestamp: string;
  agentId: string;
  runId?: string;
  error: string;
  context?: Record<string, unknown>;
}

export interface DelegationReceivedEvent {
  type: 'delegation_received';
  timestamp: string;
  fromAgent: string;
  toAgent: string;
  delegationId: string;
  task: string;
}

/**
 * Workspace Types
 */
export interface AgentWorkspace {
  id: string;
  path: string;
  files: WorkspaceFile[];
  accessLog: WorkspaceAccess[];
}

export interface WorkspaceFile {
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
  content?: string;
}

export interface WorkspaceAccess {
  timestamp: string;
  agentId: string;
  action: 'read' | 'write' | 'delete' | 'list';
  path: string;
  success: boolean;
}
