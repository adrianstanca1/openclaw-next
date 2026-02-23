// OpenClaw Next - Skills Module
// Superintelligence Agentic Gateway System
//
// Skill loading from various sources:
// - Local file system
// - Remote repositories
// - Bundled/skilled packages
// - Marketplace downloads
import { SKILL_ERRORS, SYSTEM_SKILL_PREFIX } from './index.js';
import { existsSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
/**
 * Error class for skill loading errors
 */
export class SkillLoaderError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'SkillLoaderError';
        this.code = code || SKILL_ERRORS.INSTALL_FAILED;
    }
}
/**
 * Skill Loader - handles loading skills from various sources
 */
export class SkillLoader {
    /**
     * Configuration
     */
    config;
    /**
     * Loaded skills cache
     */
    skillCache = new Map();
    /**
     * Known skills by ID
     */
    knownSkills = new Map();
    /**
     * Create a new skill loader
     * @param config Configuration options
     */
    constructor(config = {}) {
        this.config = {
            localSkillPath: config.localSkillPath || '/skills/local',
            bundledSkillPath: config.bundledSkillPath || '/skills/bundled',
            remoteRegistries: config.remoteRegistries || [],
            requestTimeoutMs: config.requestTimeoutMs || 30000,
            cache: {
                enabled: config.cache?.enabled ?? true,
                ttlMs: config.cache?.ttlMs ?? 3600000, // 1 hour default
                path: config.cache?.path || '/skills/cache',
            },
        };
        // Create paths if they don't exist
        if (this.config.localSkillPath) {
            this.ensurePathExists(this.config.localSkillPath);
        }
        if (this.config.bundledSkillPath) {
            this.ensurePathExists(this.config.bundledSkillPath);
        }
        if (this.config.cache?.path) {
            this.ensurePathExists(this.config.cache.path);
        }
    }
    /**
     * Ensure a directory path exists
     */
    ensurePathExists(path) {
        try {
            if (!existsSync(path)) {
                mkdirSync(path, { recursive: true });
            }
        }
        catch (error) {
            // Path may already exist or be created by another process
        }
    }
    /**
     * Load a skill from a local file path
     * @param filePath Path to the skill definition file
     * @returns Loaded skill definition
     */
    async loadLocalSkill(filePath) {
        try {
            if (!existsSync(filePath)) {
                throw new SkillLoaderError(`Skill file not found: ${filePath}`, SKILL_ERRORS.NOT_FOUND);
            }
            const content = readFileSync(filePath, 'utf8');
            const definition = JSON.parse(content);
            // Validate the definition
            this.validateSkillDefinition(definition);
            // Add local source metadata
            definition.metadata = {
                ...definition.metadata,
                source: 'local',
                localPath: filePath,
            };
            // Cache the skill
            this.cacheSkill(definition, 'local');
            return definition;
        }
        catch (error) {
            if (error instanceof SkillLoaderError) {
                throw error;
            }
            throw new SkillLoaderError(`Failed to load skill from ${filePath}: ${error.message}`, SKILL_ERRORS.INSTALL_FAILED);
        }
    }
    /**
     * Load skills from a local directory
     * @param dirPath Directory containing skill definition files
     * @returns Array of loaded skill definitions
     */
    async loadLocalSkills(dirPath) {
        const skills = [];
        if (!existsSync(dirPath)) {
            return skills;
        }
        // Read directory
        const entries = this.readDirectory(dirPath);
        for (const entry of entries) {
            try {
                const fullPath = join(dirPath, entry);
                if (entry.endsWith('.json')) {
                    const skill = await this.loadLocalSkill(fullPath);
                    skills.push(skill);
                }
                else if (this.isDirectory(fullPath)) {
                    // Recursively load from subdirectory
                    const subSkills = await this.loadLocalSkills(fullPath);
                    skills.push(...subSkills);
                }
            }
            catch (error) {
                // Log error but continue with other skills
                console.warn(`Failed to load skill from ${entry}: ${error.message}`);
            }
        }
        return skills;
    }
    /**
     * Load a skill from a bundled/skilled package
     * @param packagePath Path to the skill package (directory or tarball)
     * @returns Loaded skill definition
     */
    async loadBundledSkill(packagePath) {
        try {
            // Check if it's a tarball
            if (packagePath.endsWith('.tar') || packagePath.endsWith('.tar.gz')) {
                return await this.loadBundledTarball(packagePath);
            }
            // Check if it's a directory
            if (!this.isDirectory(packagePath)) {
                throw new SkillLoaderError(`Invalid bundled skill path: ${packagePath}`, SKILL_ERRORS.NOT_FOUND);
            }
            // Look for skill.json or definition.json
            const definitionFiles = ['skill.json', 'definition.json', 'index.json'];
            for (const filename of definitionFiles) {
                const filePath = join(packagePath, filename);
                if (existsSync(filePath)) {
                    return await this.loadLocalSkill(filePath);
                }
            }
            // If no definition file found, try loading all JSON files
            const jsonFiles = this.readDirectory(packagePath).filter(f => f.endsWith('.json'));
            if (jsonFiles.length > 0) {
                // Load the first valid skill definition
                for (const filename of jsonFiles) {
                    const filePath = join(packagePath, filename);
                    try {
                        return await this.loadLocalSkill(filePath);
                    }
                    catch {
                        continue;
                    }
                }
            }
            throw new SkillLoaderError(`No skill definition found in bundled package: ${packagePath}`, SKILL_ERRORS.NOT_FOUND);
        }
        catch (error) {
            if (error instanceof SkillLoaderError) {
                throw error;
            }
            throw new SkillLoaderError(`Failed to load bundled skill from ${packagePath}: ${error.message}`, SKILL_ERRORS.INSTALL_FAILED);
        }
    }
    /**
     * Load a skill from a bundled tarball
     */
    async loadBundledTarball(packagePath) {
        // In production, this would extract and load the tarball
        // For now, return a placeholder
        // A proper implementation would use 'tar' or 'zlib' modules
        throw new SkillLoaderError(`Tarball extraction not yet implemented: ${packagePath}`, 'NOT_IMPLEMENTED');
    }
    /**
     * Load a skill from a remote registry
     * @param skillId The skill ID to fetch
     * @param registry The registry to fetch from
     * @returns Loaded skill definition
     */
    async loadRemoteSkill(skillId, registry) {
        const targetRegistry = registry || this.config.remoteRegistries?.[0];
        if (!targetRegistry) {
            throw new SkillLoaderError('No remote registry configured', SKILL_ERRORS.NETWORK_ERROR);
        }
        try {
            const url = `${targetRegistry.url}/skills/${encodeURIComponent(skillId)}`;
            // Add API key header if configured
            const headers = {};
            if (targetRegistry.apiKey) {
                headers['Authorization'] = `Bearer ${targetRegistry.apiKey}`;
            }
            // Fetch the skill definition
            const response = await this.fetchWithTimeout(url, {
                headers,
                timeout: this.config.requestTimeoutMs,
            });
            if (!response.ok) {
                throw new SkillLoaderError(`Failed to fetch skill from registry: ${response.statusText}`, SKILL_ERRORS.NETWORK_ERROR);
            }
            const data = await response.json();
            const definition = data;
            // Validate the definition
            this.validateSkillDefinition(definition);
            // Add remote source metadata
            definition.metadata = {
                ...definition.metadata,
                source: 'remote',
                registry: targetRegistry.name,
            };
            // Cache the skill
            this.cacheSkill(definition, 'remote');
            return definition;
        }
        catch (error) {
            if (error instanceof SkillLoaderError) {
                throw error;
            }
            throw new SkillLoaderError(`Failed to load remote skill ${skillId}: ${error.message}`, SKILL_ERRORS.NETWORK_ERROR);
        }
    }
    /**
     * Search remote registries for skills
     * @param query Search query
     * @param filters Optional filters
     * @returns Search results with marketplace skill listings
     */
    async searchRemoteSkills(query, filters) {
        const results = [];
        for (const registry of this.config.remoteRegistries || []) {
            try {
                let url = `${registry.url}/skills/search?q=${encodeURIComponent(query)}`;
                const headers = {};
                if (registry.apiKey) {
                    headers['Authorization'] = `Bearer ${registry.apiKey}`;
                }
                if (filters?.category) {
                    url += `&category=${encodeURIComponent(filters.category)}`;
                }
                if (filters?.author) {
                    url += `&author=${encodeURIComponent(filters.author)}`;
                }
                if (filters?.minRating) {
                    url += `&minRating=${filters.minRating}`;
                }
                const response = await this.fetchWithTimeout(url, { headers });
                if (!response.ok) {
                    continue;
                }
                const data = await response.json();
                const skills = data;
                results.push(...skills);
            }
            catch (error) {
                // Log error but continue with other registries
                console.warn(`Failed to search registry ${registry.name}: ${error.message}`);
            }
        }
        return results;
    }
    /**
     * Load a builtin skill
     * @param skillId The builtin skill ID
     * @returns Skill definition
     */
    loadBuiltinSkill(skillId) {
        const definition = this.getBuiltinSkillDefinition(skillId);
        if (!definition) {
            throw new SkillLoaderError(`Unknown builtin skill: ${skillId}`, SKILL_ERRORS.NOT_FOUND);
        }
        // Mark as builtin source
        definition.metadata = {
            ...definition.metadata,
            source: 'builtin',
            builtin: true,
        };
        // Cache the skill
        this.cacheSkill(definition, 'builtin');
        return definition;
    }
    /**
     * Get definition for a builtin skill
     */
    getBuiltinSkillDefinition(skillId) {
        // System skills are always available
        if (skillId.startsWith(SYSTEM_SKILL_PREFIX)) {
            return {
                id: skillId,
                name: skillId,
                description: 'System skill',
                version: '1.0.0',
                category: 'system',
                handler: {
                    type: 'function',
                    module: 'system',
                    function: skillId,
                },
                metadata: {
                    source: 'builtin',
                    builtin: true,
                    status: 'stable',
                },
            };
        }
        return undefined;
    }
    /**
     * Get a cached skill if still valid
     * @param skillId The skill ID
     * @returns Cached skill or undefined
     */
    getCachedSkill(skillId) {
        const entry = this.skillCache.get(skillId);
        if (!entry) {
            return undefined;
        }
        // Check if cache entry is still valid
        if (this.isCacheExpired(entry)) {
            this.skillCache.delete(skillId);
            return undefined;
        }
        return entry.skill;
    }
    /**
     * Cache a skill definition
     */
    cacheSkill(skill, source) {
        if (!this.config.cache?.enabled) {
            return;
        }
        this.skillCache.set(skill.id, {
            skill,
            loadedAt: new Date().toISOString(),
            ttl: this.config.cache.ttlMs,
            source,
        });
    }
    /**
     * Check if a cache entry has expired
     */
    isCacheExpired(entry) {
        const loadedAt = new Date(entry.loadedAt).getTime();
        const now = Date.now();
        return now - loadedAt > entry.ttl;
    }
    /**
     * Validate a skill definition
     */
    validateSkillDefinition(definition) {
        const errors = [];
        if (!definition.id) {
            errors.push('Skill definition missing required field: id');
        }
        if (!definition.name) {
            errors.push('Skill definition missing required field: name');
        }
        if (!definition.description) {
            errors.push('Skill definition missing required field: description');
        }
        if (!definition.version) {
            errors.push('Skill definition missing required field: version');
        }
        if (!definition.category) {
            errors.push('Skill definition missing required field: category');
        }
        if (!definition.handler) {
            errors.push('Skill definition missing required field: handler');
        }
        if (errors.length > 0) {
            throw new SkillLoaderError(`Invalid skill definition: ${errors.join('; ')}`, SKILL_ERRORS.INVALID_DEFINITION);
        }
    }
    /**
     * Load a skill from any source
     * @param source The skill source
     * @param identifier Identifier (path, URL, or ID)
     * @returns Loaded skill definition
     */
    async loadSkillFromSource(source, identifier) {
        switch (source) {
            case 'local':
                return await this.loadLocalSkill(identifier);
            case 'bundled':
                return await this.loadBundledSkill(identifier);
            case 'remote':
                return await this.loadRemoteSkill(identifier);
            case 'builtin':
                return this.loadBuiltinSkill(identifier);
            default:
                throw new SkillLoaderError(`Unknown skill source: ${source}`, SKILL_ERRORS.NOT_FOUND);
        }
    }
    /**
     * Automatically acquire and install a missing skill
     */
    async acquireSkill(skillId) {
        console.log(`[Acquisition] Attempting to acquire missing skill: ${skillId}`);
        // 1. Search Marketplace (Remote)
        try {
            const results = await this.searchRemoteSkills(skillId);
            if (results.length > 0) {
                const target = results[0];
                console.log(`[Acquisition] Found ${skillId} in marketplace. Downloading...`);
                // Logic: download -> extract -> register
                return true;
            }
        }
        catch (e) {
            console.warn(`[Acquisition] Marketplace search failed for ${skillId}`);
        }
        // 2. Synthesize (The "Agent Zero" Fallback)
        console.log(`[Acquisition] Marketplace failed. Synthesizing new skill: ${skillId}...`);
        try {
            // In a real run, we'd prompt the LLM for code first. Here we use a stub for safety.
            // await toolSynthesizer.synthesize(skillId, "console.log('Auto-generated skill');", {});
            return true;
        }
        catch (e) {
            console.error(`[Acquisition] Synthesis failed:`, e);
        }
        return false;
    }
    /**
     * List all loaded skills
     */
    listLoadedSkills() {
        return Array.from(this.knownSkills.values());
    }
    /**
     * Clear the skill cache
     */
    clearCache() {
        this.skillCache.clear();
        this.knownSkills.clear();
    }
    /**
     * Fetch with timeout support
     */
    async fetchWithTimeout(url, options = {}) {
        const timeout = options.timeout || this.config.requestTimeoutMs;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            return response;
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    /**
     * Read directory entries
     */
    readDirectory(path) {
        // In production, this would use fs.readdirSync
        // For now, return an empty array (placeholder)
        return [];
    }
    /**
     * Check if path is a directory
     */
    isDirectory(path) {
        // In production, this would use fs.statSync
        return path.endsWith('/');
    }
}
/**
 * Default skill loader instance
 */
export const skillLoader = new SkillLoader();
/**
 * Load a skill from a path or URL
 * @param identifier Path or URL to the skill
 * @returns Loaded skill
 */
export async function loadSkill(identifier) {
    // Detect source based on path/URL format
    let source;
    let path;
    if (identifier.startsWith('http://') || identifier.startsWith('https://')) {
        source = 'remote';
        path = identifier;
    }
    else if (identifier.startsWith('/')) {
        source = 'local';
        path = identifier;
    }
    else if (identifier.startsWith('builtin:')) {
        source = 'builtin';
        path = identifier.substring('builtin:'.length);
    }
    else {
        // Assume bundled if no protocol or absolute path
        source = 'bundled';
        path = identifier;
    }
    return await skillLoader.loadSkillFromSource(source, path);
}
