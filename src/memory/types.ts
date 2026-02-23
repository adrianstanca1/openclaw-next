/**
 * OpenClaw Next - Persistent Hierarchical Memory
 * Implements L1/L2/L3 memory architecture
 */

export type MemoryLayer = 'active' | 'knowledge' | 'soul';

/**
 * L1: Active Conversation Thread
 * Short-term memory, auto-compacted
 */
export interface ActiveContext {
  sessionId: string;
  messages: MemoryMessage[];
  tokenCount: number;
  lastUpdated: string;
  summary?: string;
}

/**
 * L2: Distilled Knowledge (MEMORY.md)
 * Facts, learnings, and user preferences
 */
export interface KnowledgeEntry {
  id: string;
  content: string;
  category: 'fact' | 'preference' | 'learning' | 'code_pattern';
  tags: string[];
  confidence: number;
  source: string;
  timestamp: string;
  embedding?: number[];
}

/**
 * L3: Core Directives (SOUL.md)
 * Identity, safety rules, and immutable instructions
 */
export interface SoulDirective {
  id: string;
  category: 'identity' | 'safety' | 'mission' | 'communication';
  content: string;
  priority: number; // 0-100, higher is more important
  immutable: boolean;
}

/**
 * Unified Memory Query
 */
export interface MemoryQuery {
  query: string;
  layers?: MemoryLayer[];
  limit?: number;
  minRelevance?: number;
  filter?: {
    tags?: string[];
    category?: string;
    timeRange?: {
      start: string;
      end: string;
    };
  };
}

/**
 * Unified Memory Result
 */
export interface MemoryResult {
  content: string;
  layer: MemoryLayer;
  relevance: number;
  metadata: Record<string, unknown>;
  timestamp: string;
}

/**
 * Memory Storage Interface
 */
export interface MemoryStorage {
  // L1 Operations
  appendMessage(sessionId: string, message: MemoryMessage): Promise<void>;
  getContext(sessionId: string, maxTokens?: number): Promise<MemoryMessage[]>;
  compactContext(sessionId: string): Promise<void>;

  // L2 Operations
  addKnowledge(entry: Omit<KnowledgeEntry, 'id' | 'timestamp'>): Promise<string>;
  searchKnowledge(query: string, options?: MemoryQuery): Promise<KnowledgeEntry[]>;
  updateKnowledge(id: string, updates: Partial<KnowledgeEntry>): Promise<void>;

  // L3 Operations
  getDirectives(): Promise<SoulDirective[]>;
  updateSoul(content: string): Promise<void>;
}

export interface MemoryMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  tokens?: number;
  metadata?: Record<string, unknown>;
}
