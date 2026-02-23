---
name: warn-critical-type-changes
enabled: true
event: file
pattern: (ToolEvent|SkillMetadata|AgentConfig|PluginDefinition|ToolDefinition)\s*=|interface\s+(ToolEvent|SkillMetadata|AgentConfig|PluginDefinition|ToolDefinition)
action: warn
---

⚠️ **Critical Type Definition Being Modified**

You're editing a core type definition that affects multiple modules:
- ToolEvent - Used throughout tools module for event dispatching
- SkillMetadata - Core skill type used by marketplace and loader
- AgentConfig - Base configuration for all agents
- PluginDefinition/ToolDefinition - Core registry types

**Before continuing:**
1. Check if this change is backward compatible
2. Verify all dependent modules will still compile
3. Run `npm run build` to check for TypeScript errors
4. Consider if this needs a migration path

Types are the contract between modules - changes here ripple through the entire system.
