/**
 * OpenClaw Next - Agent Memory System
 * Superintelligence Agentic Gateway System
 *
 * Manages short-term and long-term memory for agents,
 * including embeddings, semantic search, and memory consolidation.
 */

import type { MemoryEntry, MemorySnapshot } from './types.js';
import { generateId } from '../core/utils.js';

/**
 * Memory System Options
 */
export interface MemorySystemOptions {
  maxShortTerm?: number;
  maxLongTerm?: number;
  embeddingDimension?: number;
  similarityThreshold?: number;
}

/**
 * Agent Memory System
 * Manages agent memory with short-term and long-term storage
 */
export class AgentMemorySystem {
  private shortTerm: MemoryEntry[] = [];
  private longTerm: MemoryEntry[] = [];
  private working: MemoryEntry[] = [];
  private options: MemorySystemOptions;

  constructor(options: MemorySystemOptions = {}) {
    this.options = {
      maxShortTerm: 100,
      maxLongTerm: 1000,
      embeddingDimension: 768,
      similarityThreshold: 0.7,
      ...options,
    };
  }

  /**
   * Store a memory entry (alias for store)
   * Supports both single parameter and 3-parameter signatures
   */
  async createMemory(
    entryOrAgentId: Omit<MemoryEntry, 'id' | 'createdAt' | 'lastAccessed' | 'usageCount'> | string,
    entry?: Omit<MemoryEntry, 'id' | 'createdAt' | 'lastAccessed' | 'usageCount'>,
    memoryType?: 'short-term' | 'long-term' | 'working'
  ): Promise<MemoryEntry> {
    // Handle 3-parameter signature: createMemory(agentId, entry, memoryType)
    if (typeof entryOrAgentId === 'string' && entry) {
      const newEntry = await this.store(entry as Omit<MemoryEntry, 'id' | 'createdAt' | 'lastAccessed'>);
      if (memoryType === 'working') {
        this.addToWorking(newEntry);
      }
      return newEntry;
    }
    // Handle single parameter signature: createMemory(entry)
    return this.store(entryOrAgentId as Omit<MemoryEntry, 'id' | 'createdAt' | 'lastAccessed'>);
  }

  /**
   * Store a memory entry
   */
  async store(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'lastAccessed'>): Promise<MemoryEntry> {
    const newEntry: MemoryEntry = {
      ...entry,
      id: generateId(),
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      usageCount: 0,
    };

    // Add to short-term memory
    this.shortTerm.push(newEntry);

    // Consolidate if needed
    if (this.shortTerm.length > (this.options.maxShortTerm || 100)) {
      await this.consolidate();
    }

    return newEntry;
  }

  /**
   * Retrieve memories by semantic similarity
   */
  async retrieve(query: string, limit: number = 5): Promise<MemoryEntry[]> {
    // Simple implementation - in production would use embeddings
    const queryLower = query.toLowerCase();

    const scoreEntry = (entry: MemoryEntry): number => {
      const contentLower = entry.content.toLowerCase();
      let score = 0;

      // Direct inclusion scoring
      if (contentLower.includes(queryLower)) score += 1;

      // Tag matching
      entry.tags.forEach((tag) => {
        if (queryLower.includes(tag.toLowerCase())) score += 0.5;
      });

      // Metadata context matching
      entry.metadata.context.forEach((ctx) => {
        if (ctx.toLowerCase().includes(queryLower)) score += 0.3;
      });

      return score;
    };

    // Score and sort all memories
    const allMemories = [...this.shortTerm, ...this.longTerm];
    const scored = allMemories.map((entry) => ({
      entry,
      score: scoreEntry(entry),
    }));

    scored.sort((a, b) => b.score - a.score);

    // Update access stats
    const results = scored.slice(0, limit).map((s) => {
      s.entry.lastAccessed = new Date().toISOString();
      s.entry.usageCount++;
      return s.entry;
    });

    return results;
  }

  /**
   * Get memory snapshot
   */
  getSnapshot(): MemorySnapshot {
    return {
      shortTerm: [...this.shortTerm],
      longTerm: [...this.longTerm],
      working: [...this.working],
    };
  }

  /**
   * Restore from snapshot
   */
  restoreSnapshot(snapshot: MemorySnapshot): void {
    this.shortTerm = [...snapshot.shortTerm];
    this.longTerm = [...snapshot.longTerm];
    this.working = [...snapshot.working];
  }

  /**
   * Consolidate short-term to long-term memory
   */
  private async consolidate(): Promise<void> {
    // Move oldest short-term memories to long-term
    const toMove = this.shortTerm.splice(0, this.shortTerm.length - (this.options.maxShortTerm || 100));

    for (const entry of toMove) {
      // Add to long-term
      this.longTerm.push(entry);

      // Check long-term capacity
      if (this.longTerm.length > (this.options.maxLongTerm || 1000)) {
        // Remove least important memories
        this.longTerm.sort((a, b) => {
          const scoreA = a.metadata.importance * a.usageCount;
          const scoreB = b.metadata.importance * b.usageCount;
          return scoreA - scoreB;
        });
        this.longTerm.shift();
      }
    }
  }

  /**
   * Clear all memory
   */
  clear(): void {
    this.shortTerm = [];
    this.longTerm = [];
    this.working = [];
  }

  /**
   * Get memory stats
   */
  getStats(): {
    shortTermCount: number;
    longTermCount: number;
    workingCount: number;
    totalTokens: number;
  } {
    return {
      shortTermCount: this.shortTerm.length,
      longTermCount: this.longTerm.length,
      workingCount: this.working.length,
      totalTokens: this.shortTerm.reduce((sum, e) => sum + e.content.length / 4, 0),
    };
  }

  /**
   * Add to working memory
   */
  addToWorking(entry: MemoryEntry): void {
    this.working.push(entry);
    // Keep working memory limited
    if (this.working.length > 10) {
      this.working.shift();
    }
  }

  /**
   * Clear working memory
   */
  clearWorking(): void {
    this.working = [];
  }

  /**
   * Initialize agent memory
   */
  async initializeAgentMemory(agentId?: string, config?: unknown): Promise<void> {
    this.shortTerm = [];
    this.longTerm = [];
    this.working = [];
    console.log(`Initializing memory for agent: ${agentId}`, config);
  }

  /**
   * Cleanup agent memory
   */
  async cleanupAgentMemory(agentId?: string): Promise<void> {
    this.shortTerm = [];
    this.longTerm = [];
    this.working = [];
    console.log(`Cleaning up memory for agent: ${agentId}`);
  }
}

/**
 * Global memory system instance
 */
export const agentMemorySystem = new AgentMemorySystem();
