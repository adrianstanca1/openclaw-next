/**
 * OpenClaw Next - Presets View
 * One-click agent transformation UI
 */

import React, { useState } from 'react';
import { BUILTIN_PRESETS, presetManager } from '../../presets/manager.js';

export const PresetsView: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleApply = async (id: string) => {
    setLoading(id);
    setMessage(null);
    try {
      presetManager.applyPreset(id);
      setMessage({ type: 'success', text: `Successfully transformed into ${id}!` });
    } catch (e) {
      setMessage({ type: 'error', text: `Failed to apply preset: ${id}` });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Personality Store</h1>
        <p className="text-[var(--color-text-muted)]">Transform your assistant's core directives and tools with one click.</p>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BUILTIN_PRESETS.map((preset) => (
          <div key={preset.id} className="card-hover flex flex-col h-full">
            <div className="text-4xl mb-4">
              {preset.id === 'devops-architect' && '🏗️'}
              {preset.id === 'creative-writer' && '✍️'}
              {preset.id === 'research-analyst' && '🔍'}
            </div>
            <h3 className="text-xl font-bold mb-2">{preset.name}</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-6 flex-1">
              {preset.description}
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex flex-wrap gap-2">
                {preset.tools.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleApply(preset.id)}
              disabled={!!loading}
              className={`w-full py-2 rounded-lg font-bold transition-all ${
                loading === preset.id 
                  ? 'bg-[var(--color-border)] cursor-not-allowed' 
                  : 'bg-[var(--color-primary)] text-white hover:opacity-90'
              }`}
            >
              {loading === preset.id ? 'Applying...' : 'Activate Cartridge'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
