/**
 * OpenClaw Next - Superintelligence Agentic Gateway System
 * Tools Module - Restrictions
 *
 * Provides tool usage restrictions and policies.
 */
/**
 * Tool restrictions manager
 */
export class ToolRestrictions {
    restrictions = new Map();
    /**
     * Add a restriction
     */
    addRestriction(target, restriction) {
        const existing = this.restrictions.get(target) || [];
        existing.push(restriction);
        this.restrictions.set(target, existing);
    }
    /**
     * Get restrictions for a tool
     */
    getRestrictions(target) {
        return this.restrictions.get(target) || [];
    }
    /**
     * Check if a tool is allowed
     */
    isAllowed(toolId, userId, role) {
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
    removeRestrictions(target) {
        return this.restrictions.delete(target);
    }
    /**
     * Clear all restrictions
     */
    clear() {
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
export const addToolRestriction = (target, restriction) => toolRestrictions.addRestriction(target, restriction);
/**
 * Convenience function to check if tool is allowed
 */
export const isToolAllowed = (toolId, userId, role) => toolRestrictions.isAllowed(toolId, userId, role);
