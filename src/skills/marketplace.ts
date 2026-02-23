// OpenClaw Next - Skills Module
// Superintelligence Agentic Gateway System
//
// Marketplace integration for skill discovery,
// search, installation, and management

import type {
  MarketplaceSkill,
  MarketplaceSearchResults,
  MarketplaceFacets,
  MarketplaceApiResponse,
  InstallOptions,
  SkillDefinition,
  UpdateCheckResult,
} from './types.js';

import { SKILL_ERRORS, DEFAULT_MARKETPLACE_URL } from './index.js';

/**
 * Error class for marketplace errors
 */
export class MarketplaceError extends Error {
  code: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'MarketplaceError';
    this.code = code || SKILL_ERRORS.NETWORK_ERROR;
  }
}

/**
 * Marketplace configuration
 */
export interface MarketplaceConfig {
  /**
   * Base URL for the marketplace
   */
  baseUrl?: string;

  /**
   * API key for authenticated requests
   */
  apiKey?: string;

  /**
   * User ID for personalized recommendations
   */
  userId?: string;

  /**
   * Timeout for requests
   */
  requestTimeoutMs?: number;

  /**
   * Cache configuration
   */
  cache?: {
    enabled: boolean;
    ttlMs: number;
  };
}

/**
 * Search parameters for marketplace queries
 */
export interface MarketplaceSearchOptions {
  /**
   * Search query string
   */
  query?: string;

  /**
   * Filter by category
   */
  category?: string;

  /**
   * Filter by author
   */
  author?: string;

  /**
   * Minimum rating filter
   */
  minRating?: number;

  /**
   * Maximum cost filter
   */
  maxCost?: number;

  /**
   * Include/exclude deprecated skills
   */
  includeDeprecated?: boolean;

  /**
   * Page number for pagination
   */
  page?: number;

  /**
   * Results per page
   */
  perPage?: number;

  /**
   * Sort order
   */
  sortBy?: 'relevance' | 'downloads' | 'rating' | 'updated' | 'name';
}

/**
 * Category statistics
 */
export interface CategoryStats {
  category: string;
  count: number;
  topSkills: MarketplaceSkill[];
}

/**
 * Trending skills response
 */
export interface TrendingResponse {
  skills: MarketplaceSkill[];
  period: 'daily' | 'weekly' | 'monthly';
  updated: string;
}

/**
 * User preferences response
 */
export interface UserPreferences {
  preferredCategories: string[];
  excludedAuthors: string[];
  maxCost: number;
}

/**
 * Marketplace client for interacting with the skill marketplace
 */
export class MarketplaceClient {
  /**
   * Configuration
   */
  private readonly config: MarketplaceConfig;

  /**
   * Cached search results
   */
  private readonly searchCache: Map<string, MarketplaceSearchResults> = new Map();

  /**
   * Recent searches
   */
  private recentSearches: string[] = [];

  /**
   * User preferences (in-memory)
   */
  private userPreferences: UserPreferences = {
    preferredCategories: [],
    excludedAuthors: [],
    maxCost: 100,
  };

  /**
   * Create a new marketplace client
   * @param config Configuration options
   */
  constructor(config: MarketplaceConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || DEFAULT_MARKETPLACE_URL,
      apiKey: config.apiKey,
      userId: config.userId,
      requestTimeoutMs: config.requestTimeoutMs || 30000,
      cache: {
        enabled: config.cache?.enabled ?? true,
        ttlMs: config.cache?.ttlMs ?? 300000, // 5 minutes default
      },
    };
  }

  /**
   * Browse all skills from the marketplace
   * @param options Browse options
   * @returns Page of skills
   */
  async browseSkills(options: {
    page?: number;
    perPage?: number;
    category?: string;
    sortBy?: 'relevance' | 'downloads' | 'rating' | 'updated' | 'name';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<MarketplaceSearchResults> {
    const url = this.buildUrl('/skills', options);

    try {
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        throw new MarketplaceError(
          `Marketplace API error: ${response.statusText}`,
          `HTTP_${response.status}`
        );
      }

      const data = await response.json();
      return this.parseSearchResults(data);
    } catch (error) {
      if (error instanceof MarketplaceError) {
        throw error;
      }
      throw new MarketplaceError(
        `Failed to browse skills: ${(error as Error).message}`,
        SKILL_ERRORS.NETWORK_ERROR
      );
    }
  }

  /**
   * Search skills by query
   * @param query Search query
   * @param options Search options
   * @returns Search results
   */
  async searchSkills(
    query: string,
    options: MarketplaceSearchOptions = {}
  ): Promise<MarketplaceSearchResults> {
    // Check cache first
    const cacheKey = this.getCacheKey('search', query, options);
    if (this.config.cache?.enabled) {
      const cached = this.searchCache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        return cached;
      }
    }

    const url = this.buildSearchUrl(query, options);

    try {
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        throw new MarketplaceError(
          `Marketplace API error: ${response.statusText}`,
          `HTTP_${response.status}`
        );
      }

      const data = await response.json();
      const results = this.parseSearchResults(data);

      // Cache the results
      if (this.config.cache?.enabled) {
        this.searchCache.set(cacheKey, results);
      }

      // Track recent search
      this.recentSearches = [
        query,
        ...this.recentSearches.filter((q) => q !== query),
      ].slice(0, 10);

      return results;
    } catch (error) {
      if (error instanceof MarketplaceError) {
        throw error;
      }
      throw new MarketplaceError(
        `Failed to search skills: ${(error as Error).message}`,
        SKILL_ERRORS.NETWORK_ERROR
      );
    }
  }

  /**
   * Get skill details by ID
   * @param skillId The skill identifier
   * @returns Skill details
   */
  async getSkillDetails(skillId: string): Promise<MarketplaceSkill> {
    const url = this.buildUrl(`/skills/${encodeURIComponent(skillId)}`);

    try {
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new MarketplaceError(
            `Skill not found: ${skillId}`,
            SKILL_ERRORS.NOT_FOUND
          );
        }
        throw new MarketplaceError(
          `Marketplace API error: ${response.statusText}`,
          `HTTP_${response.status}`
        );
      }

      const data = await response.json();
      return this.parseMarketplaceSkill(data);
    } catch (error) {
      if (error instanceof MarketplaceError) {
        throw error;
      }
      throw new MarketplaceError(
        `Failed to get skill details: ${(error as Error).message}`,
        SKILL_ERRORS.NETWORK_ERROR
      );
    }
  }

  /**
   * Get user's installed skills from marketplace
   * @returns List of user's installed skills
   */
  async getUserSkills(): Promise<MarketplaceSkill[]> {
    if (!this.config.userId) {
      throw new MarketplaceError(
        'User ID not configured',
        SKILL_ERRORS.PERMISSION_DENIED
      );
    }

    const url = this.buildUrl(`/users/${this.config.userId}/skills`);

    try {
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        throw new MarketplaceError(
          `Marketplace API error: ${response.statusText}`,
          `HTTP_${response.status}`
        );
      }

      const data = await response.json();
      return Array.isArray(data) ? data.map((s) => this.parseMarketplaceSkill(s)) : [];
    } catch (error) {
      if (error instanceof MarketplaceError) {
        throw error;
      }
      throw new MarketplaceError(
        `Failed to get user skills: ${(error as Error).message}`,
        SKILL_ERRORS.NETWORK_ERROR
      );
    }
  }

  /**
   * Install a skill from the marketplace
   * @param skillId The skill identifier
   * @param options Installation options
   * @returns Installation result
   */
  async installSkill(
    skillId: string,
    options: InstallOptions = {}
  ): Promise<{ success: boolean; instanceId?: string; error?: string }> {
    const url = this.buildUrl(`/skills/${encodeURIComponent(skillId)}/install`);

    const body: Record<string, unknown> = {
      version: options.version,
      config: options.config,
    };

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new MarketplaceError(
          errorData.message || `Installation failed: ${response.statusText}`,
          errorData.code || `HTTP_${response.status}`
        );
      }

      const data = await response.json();
      return {
        success: true,
        instanceId: data.instanceId,
      };
    } catch (error) {
      if (error instanceof MarketplaceError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get categories with skill counts
   * @returns Category statistics
   */
  async getCategories(): Promise<CategoryStats[]> {
    const url = this.buildUrl('/categories');

    try {
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        throw new MarketplaceError(
          `Marketplace API error: ${response.statusText}`,
          `HTTP_${response.status}`
        );
      }

      const data = await response.json();
      return data as CategoryStats[];
    } catch (error) {
      if (error instanceof MarketplaceError) {
        throw error;
      }
      throw new MarketplaceError(
        `Failed to get categories: ${(error as Error).message}`,
        SKILL_ERRORS.NETWORK_ERROR
      );
    }
  }

  /**
   * Get trending skills
   * @param period Time period
   * @returns Trending skills
   */
  async getTrending(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<TrendingResponse> {
    const url = this.buildUrl(`/trending?period=${period}`);

    try {
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        throw new MarketplaceError(
          `Marketplace API error: ${response.statusText}`,
          `HTTP_${response.status}`
        );
      }

      const data = await response.json();
      return data as TrendingResponse;
    } catch (error) {
      if (error instanceof MarketplaceError) {
        throw error;
      }
      throw new MarketplaceError(
        `Failed to get trending skills: ${(error as Error).message}`,
        SKILL_ERRORS.NETWORK_ERROR
      );
    }
  }

  /**
   * Get skill recommendations for a user
   * @returns Recommended skills
   */
  async getRecommendations(): Promise<MarketplaceSkill[]> {
    if (!this.config.userId) {
      throw new MarketplaceError(
        'User ID not configured',
        SKILL_ERRORS.PERMISSION_DENIED
      );
    }

    const url = this.buildUrl(`/users/${this.config.userId}/recommendations`);

    try {
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        throw new MarketplaceError(
          `Marketplace API error: ${response.statusText}`,
          `HTTP_${response.status}`
        );
      }

      const data = await response.json();
      return data as MarketplaceSkill[];
    } catch (error) {
      if (error instanceof MarketplaceError) {
        throw error;
      }
      throw new MarketplaceError(
        `Failed to get recommendations: ${(error as Error).message}`,
        SKILL_ERRORS.NETWORK_ERROR
      );
    }
  }

  /**
   * Get user preferences
   * @returns User preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
    if (!this.config.userId) {
      throw new MarketplaceError(
        'User ID not configured',
        SKILL_ERRORS.PERMISSION_DENIED
      );
    }

    const url = this.buildUrl(`/users/${this.config.userId}/preferences`);

    try {
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        throw new MarketplaceError(
          `Marketplace API error: ${response.statusText}`,
          `HTTP_${response.status}`
        );
      }

      const data = await response.json();
      this.userPreferences = data as UserPreferences;
      return this.userPreferences;
    } catch (error) {
      if (error instanceof MarketplaceError) {
        throw error;
      }
      throw new MarketplaceError(
        `Failed to get user preferences: ${(error as Error).message}`,
        SKILL_ERRORS.NETWORK_ERROR
      );
    }
  }

  /**
   * Update user preferences
   * @param preferences Partial preferences to update
   */
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    if (!this.config.userId) {
      throw new MarketplaceError(
        'User ID not configured',
        SKILL_ERRORS.PERMISSION_DENIED
      );
    }

    const url = this.buildUrl(`/users/${this.config.userId}/preferences`);

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new MarketplaceError(
          `Marketplace API error: ${response.statusText}`,
          `HTTP_${response.status}`
        );
      }

      const data = await response.json();
      this.userPreferences = data as UserPreferences;
      return this.userPreferences;
    } catch (error) {
      if (error instanceof MarketplaceError) {
        throw error;
      }
      throw new MarketplaceError(
        `Failed to update user preferences: ${(error as Error).message}`,
        SKILL_ERRORS.NETWORK_ERROR
      );
    }
  }

  /**
   * Check for skill updates
   * @param skillId The skill identifier
   * @param currentVersion Current version
   * @returns Update check result
   */
  async checkForUpdates(
    skillId: string,
    currentVersion: string
  ): Promise<UpdateCheckResult> {
    const url = this.buildUrl(
      `/skills/${encodeURIComponent(skillId)}/updates?version=${encodeURIComponent(currentVersion)}`
    );

    try {
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new MarketplaceError(
            `Skill not found: ${skillId}`,
            SKILL_ERRORS.NOT_FOUND
          );
        }
        throw new MarketplaceError(
          `Marketplace API error: ${response.statusText}`,
          `HTTP_${response.status}`
        );
      }

      const data = await response.json();
      return {
        skillId: data.skillId || skillId,
        installedVersion: data.installedVersion || currentVersion,
        latestVersion: data.latestVersion,
        hasUpdate: data.hasUpdate ?? false,
        releaseNotes: data.releaseNotes,
      };
    } catch (error) {
      if (error instanceof MarketplaceError) {
        throw error;
      }
      throw new MarketplaceError(
        `Failed to check for updates: ${(error as Error).message}`,
        SKILL_ERRORS.NETWORK_ERROR
      );
    }
  }

  /**
   * Get recent search history
   */
  getRecentSearches(): string[] {
    return [...this.recentSearches];
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.searchCache.clear();
    this.recentSearches = [];
  }

  /**
   * Build a URL for the marketplace API
   */
  private buildUrl(
    path: string,
    options?: Record<string, unknown>
  ): string {
    const url = new URL(this.config.baseUrl || DEFAULT_MARKETPLACE_URL);
    url.pathname = url.pathname.replace(/\/+$/, '') + path;

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Build a search URL
   */
  private buildSearchUrl(query: string, options: MarketplaceSearchOptions = {}): string {
    const url = new URL(this.config.baseUrl || DEFAULT_MARKETPLACE_URL);
    url.pathname = url.pathname.replace(/\/+$/, '') + '/skills/search';

    url.searchParams.set('q', query);

    if (options.category) {
      url.searchParams.set('category', options.category);
    }
    if (options.author) {
      url.searchParams.set('author', options.author);
    }
    if (options.minRating !== undefined) {
      url.searchParams.set('minRating', String(options.minRating));
    }
    if (options.maxCost !== undefined) {
      url.searchParams.set('maxCost', String(options.maxCost));
    }
    if (options.page) {
      url.searchParams.set('page', String(options.page));
    }
    if (options.perPage) {
      url.searchParams.set('perPage', String(options.perPage));
    }
    if (options.sortBy) {
      url.searchParams.set('sortBy', options.sortBy);
    }

    return url.toString();
  }

  /**
   * Parse search results from API response
   */
  private parseSearchResults(data: any): MarketplaceSearchResults {
    return {
      query: data.query || '',
      total: data.total || 0,
      page: data.page || 1,
      perPage: data.perPage || 20,
      skills: (data.skills || []).map((s: any) =>
        this.parseMarketplaceSkill(s)
      ),
      facets: data.facets,
    };
  }

  /**
   * Parse marketplace skill from API response
   */
  private parseMarketplaceSkill(data: any): MarketplaceSkill {
    return {
      id: data.id,
      marketplaceId: data.id, // Using id as marketplaceId for now
      name: data.name,
      description: data.description,
      longDescription: data.longDescription,
      category: data.category,
      author: data.author,
      version: data.version,
      downloads: data.downloads || 0,
      rating: data.rating,
      reviewCount: data.reviewCount,
      requires: data.requires || [],
      license: data.license,
      repository: data.repository,
      documentation: data.documentation,
      installation: data.installation,
      minGatewayVersion: data.minGatewayVersion,
      supportedGatewayVersions: data.supportedGatewayVersions,
      configSchema: data.configSchema,
      defaultConfig: data.defaultConfig,
      inputs: data.inputs,
      outputs: data.outputs,
      handler: data.handler,
      metadata: data.metadata,
    };
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(results: MarketplaceSearchResults): boolean {
    const loadedAt = new Date(results.query).getTime();
    if (isNaN(loadedAt)) {
      return false;
    }
    const now = Date.now();
    return now - loadedAt < this.config.cache!.ttlMs;
  }

  /**
   * Get cache key for search results
   */
  private getCacheKey(
    type: 'search',
    query: string,
    options: MarketplaceSearchOptions
  ): string {
    const params = new URLSearchParams();
    params.set('q', query);
    Object.entries(options)
      .filter(([_, v]) => v !== undefined && v !== null)
      .forEach(([k, v]) => params.set(k, String(v)));
    return `${type}:${params.toString()}`;
  }

  /**
   * Fetch with timeout support
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Default marketplace client instance
 */
export const marketplaceClient = new MarketplaceClient();

/**
 * Browse skills with optional pagination
 */
export async function browseMarketplaceSkills(options?: {
  page?: number;
  perPage?: number;
}): Promise<MarketplaceSearchResults> {
  return marketplaceClient.browseSkills(options);
}

/**
 * Search marketplace skills
 */
export async function searchMarketplaceSkills(
  query: string,
  options?: MarketplaceSearchOptions
): Promise<MarketplaceSearchResults> {
  return marketplaceClient.searchSkills(query, options);
}

/**
 * Get skill details from marketplace
 */
export async function getMarketplaceSkill(skillId: string): Promise<MarketplaceSkill> {
  return marketplaceClient.getSkillDetails(skillId);
}

/**
 * Install a skill from marketplace
 */
export async function installMarketplaceSkill(
  skillId: string,
  options?: InstallOptions
): Promise<{ success: boolean; instanceId?: string; error?: string }> {
  return marketplaceClient.installSkill(skillId, options);
}
