/**
 * OpenClaw Next - Enhanced Memory Manager
 * Optimized for local models with prioritized context retrieval
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { MemoryStorage, MemoryMessage, KnowledgeEntry, SoulDirective } from './types.js';

const DEFAULT_MEMORY_PATH = './workspace/.memory';
const MEMORY_FILE = 'MEMORY.md';
const SOUL_FILE = 'SOUL.md';

export class MemoryManager implements MemoryStorage {
  private basePath: string;
  private l1Cache: Map<string, MemoryMessage[]> = new Map();
  
  constructor(basePath: string = DEFAULT_MEMORY_PATH) {
    this.basePath = basePath;
    this.ensureStorage();
  }

  private ensureStorage() {
    if (!existsSync(this.basePath)) mkdirSync(this.basePath, { recursive: true });
    
    if (!existsSync(join(this.basePath, MEMORY_FILE))) {
      writeFileSync(join(this.basePath, MEMORY_FILE), '# 🧠 Knowledge Base\n\n## facts\n\n## patterns\n');
    }
    if (!existsSync(join(this.basePath, SOUL_FILE))) {
      writeFileSync(join(this.basePath, SOUL_FILE), '# 💎 Core Identity\n\n- You are OpenClaw, an autonomous digital employee.\n- You prioritize local execution for speed and privacy.\n- You learn from every interaction.\n');
    }
  }

  /**
   * L1: Get Context with sliding window for Local Models
   */
  async getContext(sessionId: string, maxTokens: number = 2000): Promise<MemoryMessage[]> {
    const history = this.l1Cache.get(sessionId) || this.loadSession(sessionId);
    
    // Simple token estimation (4 chars/token)
    let currentTokens = 0;
    const window: MemoryMessage[] = [];
    
    // Iterate backwards to keep the most recent messages
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      const tokens = (msg.content.length / 4);
      if (currentTokens + tokens > maxTokens) break;
      window.unshift(msg);
      currentTokens += tokens;
    }
    
    return window;
  }

  /**
   * L2: Search knowledge with "High Signal" priority
   */
  async searchKnowledge(query: string): Promise<KnowledgeEntry[]> {
    const content = readFileSync(join(this.basePath, MEMORY_FILE), 'utf-8');
    const entries: KnowledgeEntry[] = [];
    
    // Parse entries from MEMORY.md
    const sections = content.split('###');
    for (const section of sections.slice(1)) {
      if (this.isRelevant(section, query)) {
        entries.push(this.parseEntry(section));
      }
    }

    // Sort by confidence or relevance score (mocked for now)
    return entries.slice(0, 5);
  }

  /**
   * L3: Get Soul Directives (Fixed identity)
   */
  async getDirectives(): Promise<SoulDirective[]> {
    const content = readFileSync(join(this.basePath, SOUL_FILE), 'utf-8');
    return content.split('\n')
      .filter(line => line.startsWith('-'))
      .map((line, i) => ({
        id: `soul-${i}`,
        category: 'identity',
        content: line.substring(1).trim(),
        priority: 100,
        immutable: true
      }));
  }

  // --- Helpers ---

  async appendMessage(sessionId: string, message: MemoryMessage) {
    const history = this.l1Cache.get(sessionId) || [];
    history.push({ ...message, timestamp: new Date().toISOString() });
    this.l1Cache.set(sessionId, history);
    this.saveSession(sessionId, history);
  }

  async compactContext(sessionId: string) {
    // Logic to trigger LLM summarization of L1 -> L2 transition
  }

  async addKnowledge(entry: Omit<KnowledgeEntry, 'id' | 'timestamp'>) {
    const markdown = `\n### LEARNING (${new Date().toISOString()})\n- **Content:** ${entry.content}\n- **Tags:** ${entry.tags.join(', ')}\n- **Source:** ${entry.source}\n`;
    writeFileSync(join(this.basePath, MEMORY_FILE), readFileSync(join(this.basePath, MEMORY_FILE), 'utf-8') + markdown);
    return 'id';
  }

  async updateKnowledge(id: string, updates: Partial<KnowledgeEntry>) {}

  async updateSoul(content: string) {
    writeFileSync(join(this.basePath, SOUL_FILE), content);
  }

  private isRelevant(section: string, query: string): boolean {
    const keywords = query.toLowerCase().split(' ');
    return keywords.some(k => k.length > 3 && section.toLowerCase().includes(k));
  }

  private parseEntry(section: string): KnowledgeEntry {
    const lines = section.trim().split('\n');
    return {
      id: 'mock',
      content: lines.find(l => l.includes('**Content:**'))?.replace('- **Content:**', '').trim() || '',
      category: 'fact',
      tags: [],
      confidence: 1,
      source: 'local',
      timestamp: new Date().toISOString()
    };
  }

  private loadSession(id: string): MemoryMessage[] {
    const path = join(this.basePath, `session_${id}.json`);
    if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf-8'));
    return [];
  }

  private saveSession(id: string, msgs: MemoryMessage[]) {
    writeFileSync(join(this.basePath, `session_${id}.json`), JSON.stringify(msgs, null, 2));
  }
}

export const memoryManager = new MemoryManager();
