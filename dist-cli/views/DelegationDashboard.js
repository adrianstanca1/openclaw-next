import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// OpenClaw Next - Delegation Dashboard
// Manage agent-to-agent task delegation and subagent orchestration
import { useState, useEffect, useCallback } from 'react';
import { smartApiServer } from '../core/api-server.js';
import { agentManager } from '../agents/index.js';
/**
 * Delegation Dashboard
 * Interface for managing agent delegation and subagent relationships
 */
export const DelegationDashboard = () => {
    const [agents, setAgents] = useState([]);
    const [subagents, setSubagents] = useState([]);
    const [activeDelegations, setActiveDelegations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    // Load data on mount
    useEffect(() => {
        loadData();
        const interval = setInterval(loadDelegations, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, []);
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadAgents(),
                loadSubagents(),
                loadDelegations(),
            ]);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const loadAgents = async () => {
        const list = await agentManager.getAllAgents();
        setAgents(list.map(instance => instance.config));
    };
    const loadSubagents = async () => {
        const subs = await smartApiServer.getSubagentStatus();
        setSubagents(subs);
    };
    const loadDelegations = async () => {
        const tasks = await smartApiServer.getActiveDelegations();
        setActiveDelegations(tasks);
    };
    // Create subagent
    const handleCreateSubagent = async (config) => {
        try {
            await smartApiServer.createSubagent({
                id: `subagent-${Date.now()}`,
                name: config.name,
                role: config.role,
                parentAgentId: config.parentAgentId,
                capabilities: config.capabilities,
                status: 'idle',
                createdAt: new Date().toISOString(),
            });
            await loadSubagents();
            setShowCreateModal(false);
        }
        catch (error) {
            console.error('Failed to create subagent:', error);
        }
    };
    // Delegate task
    const handleDelegate = async (request) => {
        try {
            const result = await smartApiServer.delegateTask(request);
            if (result.success) {
                await loadDelegations();
            }
            return result;
        }
        catch (error) {
            console.error('Delegation failed:', error);
            throw error;
        }
    };
    // Terminate delegation
    const handleTerminate = async (taskId) => {
        if (confirm('Terminate this delegation task?')) {
            await smartApiServer.terminateDelegation(taskId);
            await loadDelegations();
        }
    };
    if (loading) {
        return (_jsx("div", { className: "p-8 flex items-center justify-center", children: _jsx("div", { className: "animate-spin w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Agent Delegation" }), _jsx("p", { className: "text-[var(--color-text-muted)]", children: "Manage task delegation between agents and subagents" })] }), _jsx("div", { className: "flex gap-2", children: _jsxs("button", { onClick: () => setShowCreateModal(true), className: "btn-primary", children: [_jsx("span", { className: "mr-2", children: "+" }), "Create Subagent"] }) })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsx(StatCard, { label: "Total Agents", value: agents.length, icon: "\uD83E\uDD16", color: "text-blue-500" }), _jsx(StatCard, { label: "Subagents", value: subagents.length, icon: "\uD83D\uDC65", color: "text-purple-500" }), _jsx(StatCard, { label: "Active Delegations", value: activeDelegations.filter(d => d.status === 'active').length, icon: "\uD83D\uDCCB", color: "text-green-500" }), _jsx(StatCard, { label: "Completed Today", value: activeDelegations.filter(d => d.status === 'completed').length, icon: "\u2705", color: "text-emerald-500" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-1 space-y-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Available Agents" }), _jsx("div", { className: "space-y-3", children: agents.map((agent) => (_jsx(AgentDelegationCard, { agent: agent, subagentCount: subagents.filter(s => s.parentAgentId === agent.id).length, activeTaskCount: activeDelegations.filter(d => d.fromAgent === agent.id).length, isSelected: selectedAgent === agent.id, onSelect: () => setSelectedAgent(agent.id) }, agent.id))) })] }), _jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Active Delegations" }), activeDelegations.length === 0 ? (_jsx(EmptyDelegationState, {})) : (_jsx("div", { className: "space-y-3", children: activeDelegations.map((delegation) => (_jsx(DelegationCard, { delegation: delegation, onTerminate: () => handleTerminate(delegation.id) }, delegation.id))) }))] })] }), showCreateModal && (_jsx(CreateSubagentModal, { agents: agents, onClose: () => setShowCreateModal(false), onCreate: handleCreateSubagent }))] }));
};
const StatCard = ({ label, value, icon, color }) => (_jsx("div", { className: "card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-[var(--color-text-muted)]", children: label }), _jsx("p", { className: `text-2xl font-bold ${color || ''}`, children: value })] }), _jsx("span", { className: "text-2xl", children: icon })] }) }));
const AgentDelegationCard = ({ agent, subagentCount, activeTaskCount, isSelected, onSelect, }) => (_jsxs("div", { onClick: onSelect, className: `card cursor-pointer transition-all ${isSelected ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20' : ''}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold", children: agent.name.charAt(0).toUpperCase() }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "font-semibold truncate", children: agent.name }), _jsx("p", { className: "text-sm text-[var(--color-text-muted)] capitalize", children: agent.role })] })] }), _jsxs("div", { className: "flex items-center gap-4 mt-3 text-sm text-[var(--color-text-muted)]", children: [_jsxs("span", { title: "Subagents", children: ["\uD83D\uDC65 ", subagentCount] }), _jsxs("span", { title: "Active tasks", children: ["\uD83D\uDCCB ", activeTaskCount] })] })] }));
const DelegationCard = ({ delegation, onTerminate, }) => {
    const statusColors = {
        pending: 'bg-yellow-500/20 text-yellow-500',
        active: 'bg-blue-500/20 text-blue-500',
        completed: 'bg-green-500/20 text-green-500',
        failed: 'bg-red-500/20 text-red-500',
    };
    return (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("h3", { className: "font-semibold", children: delegation.task }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${statusColors[delegation.status]}`, children: delegation.status })] }), _jsx("p", { className: "text-sm text-[var(--color-text-muted)] mb-3", children: delegation.description }), _jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-[var(--color-text-muted)]", children: "From:" }), _jsx("span", { className: "font-medium", children: delegation.fromAgentName })] }), _jsx("span", { className: "text-[var(--color-text-muted)]", children: "\u2192" }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-[var(--color-text-muted)]", children: "To:" }), _jsx("span", { className: "font-medium", children: delegation.toAgentName })] })] })] }), delegation.status === 'active' && (_jsx("button", { onClick: onTerminate, className: "p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors", title: "Terminate delegation", children: "\u23F9\uFE0F" }))] }), delegation.progress !== undefined && (_jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { className: "text-[var(--color-text-muted)]", children: "Progress" }), _jsxs("span", { children: [delegation.progress, "%"] })] }), _jsx("div", { className: "h-2 bg-[var(--color-surface-hover)] rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-[var(--color-primary)] transition-all", style: { width: `${delegation.progress}%` } }) })] }))] }));
};
/**
 * Empty State
 */
const EmptyDelegationState = () => (_jsxs("div", { className: "text-center py-16 card", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDCCB" }), _jsx("h3", { className: "text-xl font-bold mb-2", children: "No Active Delegations" }), _jsx("p", { className: "text-[var(--color-text-muted)] mb-6 max-w-md mx-auto", children: "Select an agent and delegate a task to get started" })] }));
const CreateSubagentModal = ({ agents, onClose, onCreate, }) => {
    const [formData, setFormData] = useState({
        name: '',
        role: 'worker',
        parentAgentId: '',
        capabilities: ['reasoning', 'tool_use'],
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/50", onClick: onClose }), _jsxs("div", { className: "relative bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] w-full max-w-lg", children: [_jsx("div", { className: "p-6 border-b border-[var(--color-border)]", children: _jsx("h2", { className: "text-xl font-bold", children: "Create Subagent" }) }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Name" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "input", required: true, placeholder: "e.g., Code Reviewer" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Role" }), _jsxs("select", { value: formData.role, onChange: (e) => setFormData({ ...formData, role: e.target.value }), className: "select", children: [_jsx("option", { value: "worker", children: "Worker" }), _jsx("option", { value: "specialist", children: "Specialist" }), _jsx("option", { value: "coordinator", children: "Coordinator" }), _jsx("option", { value: "validator", children: "Validator" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Parent Agent" }), _jsxs("select", { value: formData.parentAgentId, onChange: (e) => setFormData({ ...formData, parentAgentId: e.target.value }), className: "select", required: true, children: [_jsx("option", { value: "", children: "Select parent agent" }), agents.map((agent) => (_jsxs("option", { value: agent.id, children: [agent.name, " (", agent.role, ")"] }, agent.id)))] })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "btn-secondary", children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary", children: "Create Subagent" })] })] })] })] }));
};
export default DelegationDashboard;
