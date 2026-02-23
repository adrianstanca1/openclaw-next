/**
 * OpenClaw Next - Superintelligence Agentic Gateway System
 * Tools Module - Restrictions
 *
 * Provides tool usage restrictions and policies.
 */

import type { ToolId, ToolCategory } from './types';

/**
 * Tool restriction configuration
 */
export interface ToolRestriction {
  toolId?: ToolId;
  category?: ToolCategory;
  allowedUsers?: string[];
  blockedUsers?: string[];
  allowedRoles?: string[];
  timeWindows?: { start: number; end: number }[];
  maxExecutionsPerSession?: number;
  maxExecutionsPerDay?: number;
}

/**
 * Tool restrictions manager
 */
export class ToolRestrictions {
  private restrictions: Map<ToolId | ToolCategory, ToolRestriction[]> = new Map();

  /**
   * Add a restriction
   */
  addRestriction(target: ToolId | ToolCategory, restriction: ToolRestriction): void {
    const existing = this.restrictions.get(target) || [];
    existing.push(restriction);
    this.restrictions.set(target, existing);
  }

  /**
   * Get restrictions for a tool
   */
  getRestrictions(target: ToolId | ToolCategory): ToolRestriction[] {
    return this.restrictions.get(target) || [];
  }

  /**
   * Check if a tool is allowed
   */
  isAllowed(toolId: ToolId, userId?: string, role?: string): boolean {
    const restrictions = this.getRestrictions(toolId);

    for (const restriction of restrictions) {
      // Check blocked users
      if (userId && restriction.blockedUsers?.includes(userId)) {
        return false;
      }

      // Check allowed users
      if (restriction.allowedUsers && !restriction.allowedUsers.includes(userId || '')) {
        return false;
      }

      // Check allowed roles
      if (restriction.allowedRoles && (!role || !restriction.allowedRoles.includes(role))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Remove restrictions for a tool
   */
  removeRestrictions(target: ToolId | ToolCategory): boolean {
    return this.restrictions.delete(target);
  }

  /**
   * Clear all restrictions
   */
  clear(): void {
    this.restrictions.clear();
  }
}

/**
 * Singleton instance
 */
export const toolRestrictions = new ToolRestrictions();

/**
 * Convenience function to add restriction
 */
export const addToolRestriction = (target: ToolId | ToolCategory, restriction: ToolRestriction): void =>
  toolRestrictions.addRestriction(target, restriction);

/**
 * Convenience function to check if tool is allowed
 */
export const isToolAllowed = (toolId: ToolId, userId?: string, role?: string): boolean =>
  toolRestrictions.isAllowed(toolId, userId, role);
