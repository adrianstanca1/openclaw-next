// OpenClaw Next - Core Utilities
// Superintelligence Platform for Agentic Gateways

import type { SessionState, Message, ToolCall, ActivityLog, AgentConfig, AgentCapability } from './types.js';

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

/**
 * Format duration in human-readable form
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

/**
 * Format cost in USD
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

/**
 * Sanitize user input for display
 */
export function sanitizeInput(input: string, maxLen: number = 1000): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .slice(0, maxLen);
}

/**
 * Parse heartbeat interval string to milliseconds
 */
export function parseHeartbeatInterval(interval: string): number {
  const match = interval.match(/^(\d+)([smhd])$/);
  if (!match) return 30 * 60 * 1000; // default 30m

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * (multipliers as Record<string, number>)[unit];
}

/**
 * Create a system message
 */
export function createSystemMessage(content: string): Message {
  return {
    id: generateId('sys'),
    sender: 'system',
    content,
    type: 'text',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a tool call result
 */
export function createToolResult(
  toolName: string,
  status: 'pending' | 'executing' | 'completed' | 'failed',
  result?: unknown,
  error?: string,
): ToolCall {
  return {
    id: generateId('tool'),
    name: toolName,
    parameters: {},
    status,
    result,
    error,
  };
}

/**
 * Create an activity log entry
 */
export function createActivityLog(
  type: ActivityLog['type'],
  details: ActivityLog['details'],
  severity: ActivityLog['severity'] = 'info',
): ActivityLog {
  return {
    id: generateId('log'),
    type,
    timestamp: new Date().toISOString(),
    details,
    severity,
  };
}

/**
 * Calculate session statistics
 */
export function calculateSessionStats(session: SessionState) {
  const messages = session.history.filter((m) => m.sender !== 'system');
  const tools = session.history.flatMap((m) => m.toolCalls || []);
  const uniqueTools = new Set(tools.map((t) => t.name));

  return {
    messageCount: messages.length,
    toolCount: tools.length,
    uniqueTools: uniqueTools.size,
    durationMs: new Date(session.updatedAt).getTime() - new Date(session.createdAt).getTime(),
    agentId: session.agentId,
  };
}

/**
 * Check if agent has a specific capability
 */
export function agentHasCapability(agent: AgentConfig, capability: string): boolean {
  return agent.capabilities.includes(capability as AgentCapability);
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: unknown;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      lastResult = func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

/**
 * Compare versions
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

/**
 * URL-safe base64 encoding
 */
export function base64Encode(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16)),
  ));
}

/**
 * URL-safe base64 decoding
 */
export function base64Decode(str: string): string {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map((c) => `%${`0${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(''),
  );
}
