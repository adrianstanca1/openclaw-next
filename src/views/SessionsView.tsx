// OpenClaw Next - Sessions View
// Monitor and visualize agent execution traces and sessions

import React, { useState, useEffect, useCallback } from 'react';
import { TraceVisualization } from '../ui/components/TraceVisualization.js';
import type { AgentRun, ReasoningStep } from '../agents/types.js';
import { StatCard } from '../ui/components/StatCard.js';

/**
 * Sessions View
 * Main interface for monitoring agent sessions and reasoning traces
 */
export const SessionsView: React.FC = () => {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration if no active runs
  const mockRuns: AgentRun[] = [
    {
      id: 'run-001',
      agentId: 'agent-001',
      sessionId: 'session-001',
      state: 'active' as any,
      startTimestamp: new Date(Date.now() - 300000).toISOString(),
      input: { message: 'Analyze the recent market trends for AI hardware.' },
      reasoningTrace: [
        {
          id: 'step-1',
          type: 'analysis',
          timestamp: new Date(Date.now() - 290000).toISOString(),
          content: 'Analyzing the request for AI hardware market trends. Key players: NVIDIA, AMD, Intel, Blackwell architecture.',
          metadata: { keyInsights: ['Blackwell demand is exceeding supply', 'HBM3e memory shortage'] }
        },
        {
          id: 'step-2',
          type: 'plan',
          timestamp: new Date(Date.now() - 280000).toISOString(),
          content: `Plan:
1. Search for recent financial reports.
2. Analyze supply chain constraints.
3. Synthesize impact on AI startups.`,
        },
        {
          id: 'step-3',
          type: 'execution',
          timestamp: new Date(Date.now() - 250000).toISOString(),
          content: 'Executing search: "AI hardware supply chain constraints 2026"',
        },
        {
          id: 'step-4',
          type: 'observation',
          timestamp: new Date(Date.now() - 200000).toISOString(),
          content: 'Found reports indicating significant lead times for advanced packaging (CoWoS) are still a bottleneck.',
        },
        {
          id: 'step-5',
          type: 'reflection',
          timestamp: new Date(Date.now() - 150000).toISOString(),
          content: 'The supply chain bottleneck shift from HBM to packaging changes the ROI calculation for smaller clusters.',
        }
      ],
      actions: [],
      observations: [],
      memoriesCreated: [],
      toolsUsed: ['search-engine'],
      skillsUsed: ['market-analysis'],
      metadata: {}
    }
  ];

  useEffect(() => {
    // In a real app, we would fetch from API
    // For now, use mock data
    setRuns(mockRuns);
    setLoading(false);
  }, []);

  const selectedRun = runs.find(r => r.id === selectedRunId) || runs[0];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sessions & Traces</h1>
          <p className="text-[var(--color-text-muted)]">
            Monitor real-time agent reasoning and execution history
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => {}}>Refresh</button>
          <button className="btn-primary" onClick={() => {}}>New Session</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Runs List */}
        <div className="lg:col-span-1 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]">
            <h2 className="font-semibold">Recent Sessions</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {runs.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-text-muted)]">
                No active sessions
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {runs.map(run => (
                  <div 
                    key={run.id}
                    className={`p-4 cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors ${selectedRunId === run.id ? 'bg-[var(--color-primary)]/10 border-l-4 border-[var(--color-primary)]' : ''}`}
                    onClick={() => setSelectedRunId(run.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-[var(--color-text-muted)]">{run.id}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${run.state === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-slate-500/20 text-slate-500'}`}>
                        {run.state}
                      </span>
                    </div>
                    <div className="font-medium truncate mb-1">{run.input.message}</div>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                      <span>🤖 {run.agentId}</span>
                      <span>•</span>
                      <span>{new Date(run.startTimestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trace Visualization */}
        <div className="lg:col-span-2 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] flex flex-col overflow-hidden">
          {selectedRun ? (
            <>
              <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-hover)]">
                <div>
                  <h2 className="font-semibold">Execution Trace: {selectedRun.id}</h2>
                  <p className="text-xs text-[var(--color-text-muted)] truncate max-w-md">
                    {selectedRun.input.message}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="badge-info">{selectedRun.toolsUsed.length} Tools</span>
                  <span className="badge-success">{selectedRun.reasoningTrace.length} Steps</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <TraceVisualization 
                  steps={selectedRun.reasoningTrace} 
                  onStepClick={(step) => console.log('Step clicked:', step)}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)]">
              Select a session to view its trace
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionsView;
