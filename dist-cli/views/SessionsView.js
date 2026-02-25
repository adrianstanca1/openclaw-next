import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// OpenClaw Next - Sessions View
// Monitor and visualize agent execution traces and sessions
import { useState, useEffect } from 'react';
import { TraceVisualization } from '../ui/components/TraceVisualization.js';
/**
 * Sessions View
 * Main interface for monitoring agent sessions and reasoning traces
 */
export const SessionsView = () => {
    const [runs, setRuns] = useState([]);
    const [selectedRunId, setSelectedRunId] = useState(null);
    const [loading, setLoading] = useState(true);
    // Mock data for demonstration if no active runs
    const mockRuns = [
        {
            id: 'run-001',
            agentId: 'agent-001',
            sessionId: 'session-001',
            state: 'active',
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
    return (_jsxs("div", { className: "p-6 h-full flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Sessions & Traces" }), _jsx("p", { className: "text-[var(--color-text-muted)]", children: "Monitor real-time agent reasoning and execution history" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "btn-secondary", onClick: () => { }, children: "Refresh" }), _jsx("button", { className: "btn-primary", onClick: () => { }, children: "New Session" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0", children: [_jsxs("div", { className: "lg:col-span-1 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] overflow-hidden flex flex-col", children: [_jsx("div", { className: "p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]", children: _jsx("h2", { className: "font-semibold", children: "Recent Sessions" }) }), _jsx("div", { className: "flex-1 overflow-y-auto", children: runs.length === 0 ? (_jsx("div", { className: "p-8 text-center text-[var(--color-text-muted)]", children: "No active sessions" })) : (_jsx("div", { className: "divide-y divide-[var(--color-border)]", children: runs.map(run => (_jsxs("div", { className: `p-4 cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors ${selectedRunId === run.id ? 'bg-[var(--color-primary)]/10 border-l-4 border-[var(--color-primary)]' : ''}`, onClick: () => setSelectedRunId(run.id), children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-xs font-mono text-[var(--color-text-muted)]", children: run.id }), _jsx("span", { className: `text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${run.state === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-slate-500/20 text-slate-500'}`, children: run.state })] }), _jsx("div", { className: "font-medium truncate mb-1", children: run.input.message }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-[var(--color-text-muted)]", children: [_jsxs("span", { children: ["\uD83E\uDD16 ", run.agentId] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: new Date(run.startTimestamp).toLocaleTimeString() })] })] }, run.id))) })) })] }), _jsx("div", { className: "lg:col-span-2 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] flex flex-col overflow-hidden", children: selectedRun ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-hover)]", children: [_jsxs("div", { children: [_jsxs("h2", { className: "font-semibold", children: ["Execution Trace: ", selectedRun.id] }), _jsx("p", { className: "text-xs text-[var(--color-text-muted)] truncate max-w-md", children: selectedRun.input.message })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("span", { className: "badge-info", children: [selectedRun.toolsUsed.length, " Tools"] }), _jsxs("span", { className: "badge-success", children: [selectedRun.reasoningTrace.length, " Steps"] })] })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-6", children: _jsx(TraceVisualization, { steps: selectedRun.reasoningTrace, onStepClick: (step) => console.log('Step clicked:', step) }) })] })) : (_jsx("div", { className: "flex-1 flex items-center justify-center text-[var(--color-text-muted)]", children: "Select a session to view its trace" })) })] })] }));
};
export default SessionsView;
