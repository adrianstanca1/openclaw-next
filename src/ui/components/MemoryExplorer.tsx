/**
 * OpenClaw Next - Memory Explorer Component
 * Visualizes L1 (Context), L2 (Knowledge), and L3 (Soul) layers
 */

import React, { useState } from 'react';
import type { MemoryLayer } from '../../memory/types.js';

interface MemoryExplorerProps {
  layers: {
    l1: any[]; // Active context
    l2: any[]; // MEMORY.md entries
    l3: any[]; // SOUL.md directives
  };
}

export const MemoryExplorer: React.FC<MemoryExplorerProps> = ({ layers }) => {
  const [activeLayer, setActiveLayer] = useState<MemoryLayer>('active');

  return (
    <div className="card h-full flex flex-col">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          🧠 Persistent Hierarchical Memory
        </h3>
        <div className="flex gap-1 bg-[var(--color-bg)] p-1 rounded-lg">
          {(['active', 'knowledge', 'soul'] as MemoryLayer[]).map((l) => (
            <button
              key={l}
              onClick={() => setActiveLayer(l)}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                activeLayer === l
                  ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {l === 'active' && 'L1: Active'}
              {l === 'knowledge' && 'L2: Knowledge'}
              {l === 'soul' && 'L3: Soul'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeLayer === 'active' && (
          <div className="space-y-3">
            {layers.l1.map((msg, i) => (
              <div key={i} className={`p-3 rounded-lg border ${
                msg.role === 'user' ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20' : 'bg-[var(--color-surface-hover)] border-[var(--color-border)]'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-50">{msg.role}</span>
                  <span className="text-[10px] opacity-50">{msg.tokens} tokens</span>
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
            ))}
          </div>
        )}

        {activeLayer === 'knowledge' && (
          <div className="space-y-3">
            {layers.l2.map((entry, i) => (
              <div key={i} className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="badge-info text-[10px]">{entry.category}</span>
                  <span className="text-[10px] opacity-50">{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-medium mb-1">{entry.content}</p>
                <div className="flex gap-1">
                  {entry.tags?.map((t: string) => (
                    <span key={t} className="text-[9px] px-1 bg-[var(--color-bg)] rounded border border-[var(--color-border)]">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeLayer === 'soul' && (
          <div className="space-y-2">
            {layers.l3.map((directive, i) => (
              <div key={i} className="flex gap-3 items-start p-2 hover:bg-[var(--color-surface-hover)] rounded-md transition-colors">
                <span className="text-[var(--color-primary)] text-xs mt-0.5">•</span>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed italic">
                  "{directive.content}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
