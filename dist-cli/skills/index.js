// OpenClaw Next - Skills Module
// Superintelligence Agentic Gateway System
//
// This module provides skill management capabilities including:
// - Skill discovery from multiple sources (local, remote, marketplace)
// - Lifecycle management (install, enable, disable, uninstall)
// - Dependency resolution and requirement checking
// - Skill execution with proper error handling
// - Marketplace integration
export * from './types.js';
export { SkillCreator, skillCreator } from './skill-creator.js';
export * from './skill-creator.js';
/**
 * Module version
 */
export const SKILLS_MODULE_VERSION = '1.0.0';
/**
 * Default marketplace URL
 */
export const DEFAULT_MARKETPLACE_URL = 'https://marketplace.openclaw.dev';
/**
 * Built-in skills that are always available
 */
export const BUILTIN_SKILLS = {
    FILESYSTEM: 'filesystem',
    BASH: 'bash',
    WEB: 'web',
    MEMORY: 'memory',
    HTTP: 'http',
    CALCULATOR: 'calculator',
    DATETIME: 'datetime',
    STRING: 'string',
    JSON: 'json',
    LOGIC: 'logic',
};
/**
 * System skill prefixes (used for internal skills)
 */
export const SYSTEM_SKILL_PREFIX = 'system.';
/**
 * Skill events
 */
export const SKILL_EVENTS = {
    INSTALLED: 'skill_installed',
    ENABLED: 'skill_enabled',
    DISABLED: 'skill_disabled',
    UNINSTALLED: 'skill_uninstalled',
    UPDATED: 'skill_updated',
    ERROR: 'skill_error',
    EXECUTION_STARTED: 'execution_started',
    EXECUTION_COMPLETED: 'execution_completed',
    EXECUTION_FAILED: 'execution_failed',
    REQUIREMENTS_CHANGED: 'requirements_changed',
    DEPENDENCY_INSTALLED: 'dependency_installed',
};
/**
 * Skill requirement types
 */
export const REQUIREMENT_TYPES = {
    SKILL: 'skill',
    PACKAGE: 'package',
    API_KEY: 'apiKey',
    ENVIRONMENT: 'environment',
    PERMISSION: 'permission',
    MODEL: 'model',
};
/**
 * Skill execution types
 */
export const EXECUTION_TYPES = {
    FUNCTION: 'function',
    COMMAND: 'command',
    HTTP: 'http',
    DOCKER: 'docker',
    SCRIPT: 'script',
};
/**
 * Skill states
 */
export const SKILL_STATES = {
    INSTALLED: 'installed',
    ENABLED: 'enabled',
    DISABLED: 'disabled',
    ERROR: 'error',
    LOADING: 'loading',
    UNINSTALLING: 'uninstalling',
};
/**
 * Skill source types
 */
export const SKILL_SOURCES = {
    LOCAL: 'local',
    REMOTE: 'remote',
    BUNDLED: 'bundled',
    MARKETPLACE: 'marketplace',
    BUILTIN: 'builtin',
};
/**
 * Skill categories
 */
export const SKILL_CATEGORIES = [
    'development',
    'data',
    'communication',
    'automation',
    'analysis',
    'creation',
    'management',
    'integration',
    'security',
    'testing',
];
/**
 * Default configuration for skill installation
 */
export const DEFAULT_INSTALL_OPTIONS = {
    version: '',
    skipRequirements: false,
    config: {},
    agentId: '',
    source: 'marketplace',
    installPath: '',
};
/**
 * Error codes for skills module
 */
export const SKILL_ERRORS = {
    INVALID_DEFINITION: 'INVALID_SKILL_DEFINITION',
    MISSING_REQUIREMENT: 'MISSING_SKILL_REQUIREMENT',
    UNSATISFIED_REQUIREMENT: 'UNSATISFIED_SKILL_REQUIREMENT',
    INSTALL_FAILED: 'SKILL_INSTALLATION_FAILED',
    UNINSTALL_FAILED: 'SKILL_UNINSTALLATION_FAILED',
    EXECUTION_FAILED: 'SKILL_EXECUTION_FAILED',
    CONFIG_INVALID: 'SKILL_CONFIG_INVALID',
    NOT_FOUND: 'SKILL_NOT_FOUND',
    ALREADY_INSTALLED: 'SKILL_ALREADY_INSTALLED',
    CIRCULAR_DEPENDENCY: 'CIRCULAR_SKILL_DEPENDENCY',
    VERSION_CONFLICT: 'SKILL_VERSION_CONFLICT',
    NETWORK_ERROR: 'SKILL_NETWORK_ERROR',
    PERMISSION_DENIED: 'SKILL_PERMISSION_DENIED',
    RESOURCE_EXHAUSTED: 'SKILL_RESOURCE_EXHAUSTED',
    TIMEOUT: 'SKILL_EXECUTION_TIMEOUT',
};
/**
 * Default skill configuration
 */
export const DEFAULT_SKILL_CONFIG = {
    [BUILTIN_SKILLS.FILESYSTEM]: {
        root: './workspace',
        allowWrite: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedExtensions: ['*'],
    },
    [BUILTIN_SKILLS.BASH]: {
        timeout: 30000,
        allowNetwork: false,
        allowedCommands: ['*'],
        maxOutputSize: 100000,
    },
    [BUILTIN_SKILLS.WEB]: {
        timeout: 30000,
        maxLinks: 10,
        maxDepth: 2,
        rateLimit: 5, // requests per second
    },
    [BUILTIN_SKILLS.MEMORY]: {
        capacity: 1000,
        retentionDays: 30,
        embeddingModel: 'default',
    },
};
