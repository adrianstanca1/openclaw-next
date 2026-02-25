import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// OpenClaw Next - Agent Dashboard View
// Display and manage agents using the AgentManager
import { useState, useEffect, useCallback, useMemo } from "react";
import { agentManager } from "../agents/index.js";
import { AgentState } from "../agents/types.js";
import { AgentRole, AgentCapability } from "../core/types.js";
import { EmptyState } from "../ui/components/EmptyState.js";
import { StatCard } from "../ui/components/StatCard.js";
/**
 * Agent Dashboard View
 * Main interface for viewing and managing agents
 */
export const AgentDashboard = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        search: "",
        category: null,
        status: null,
        sortBy: "name",
        sortOrder: "asc",
    });
    const [modal, setModal] = useState({
        isOpen: false,
        type: null,
    });
    const [selectedAgent, setSelectedAgent] = useState(null);
    // Load agents on mount
    useEffect(() => {
        loadAgents();
    }, []);
    // Load agents from manager
    const loadAgents = useCallback(async () => {
        setLoading(true);
        try {
            const agentList = agentManager.getAllAgents();
            const agentData = agentList.map((instance) => {
                const health = agentManager.getAgentHealth(instance.id);
                return {
                    config: instance.config,
                    state: instance.state,
                    sessionCount: 0,
                    lastActive: instance.lastHeartbeat || instance.config.createdAt || new Date().toISOString(),
                    health: calculateHealth(instance.state),
                };
            });
            setAgents(agentData);
        }
        catch (error) {
            console.error("Failed to load agents:", error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    // Calculate agent health based on state
    const calculateHealth = (state) => {
        if (!state)
            return "unknown";
        if (state === AgentState.ERROR)
            return "error";
        if (state === AgentState.ACTIVE || state === AgentState.THINKING || state === AgentState.ACTING)
            return "healthy";
        if (state === AgentState.IDLE)
            return "healthy";
        if (state === AgentState.WAITING || state === AgentState.SUSPENDED)
            return "warning";
        return "unknown";
    };
    // Filter and sort agents
    const filteredAgents = useMemo(() => {
        let result = [...agents];
        // Search filter
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            result = result.filter((agent) => agent.config.name.toLowerCase().includes(searchLower) ||
                agent.config.role.toLowerCase().includes(searchLower) ||
                agent.config.id.toLowerCase().includes(searchLower));
        }
        // Status filter
        if (filter.status) {
            result = result.filter((agent) => agent.state === filter.status);
        }
        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            switch (filter.sortBy) {
                case "name":
                    comparison = a.config.name.localeCompare(b.config.name);
                    break;
                case "date":
                    comparison =
                        new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
                    break;
                case "usage":
                    comparison = b.sessionCount - a.sessionCount;
                    break;
            }
            return filter.sortOrder === "asc" ? comparison : -comparison;
        });
        return result;
    }, [agents, filter]);
    // Create new agent
    const handleCreateAgent = useCallback(() => {
        setModal({ isOpen: true, type: "create" });
    }, []);
    // Edit agent
    const handleEditAgent = useCallback((agent) => {
        setSelectedAgent(agent);
        setModal({ isOpen: true, type: "edit" });
    }, []);
    // Delete agent
    const handleDeleteAgent = useCallback(async (agentId) => {
        if (window.confirm("Are you sure you want to delete this agent?")) {
            try {
                await agentManager.terminateAgent(agentId); // Corrected method
                await loadAgents();
            }
            catch (error) {
                console.error("Failed to delete agent:", error);
                alert("Failed to delete agent");
            }
        }
    }, [loadAgents]);
    // Pause/Resume agent
    const handleToggleAgent = useCallback(async (agentId, currentState) => {
        try {
            if (currentState === AgentState.ACTIVE || currentState === AgentState.THINKING) {
                await agentManager.suspendAgent(agentId); // Corrected method
            }
            else {
                await agentManager.resumeAgent(agentId);
            }
            await loadAgents();
        }
        catch (error) {
            console.error("Failed to toggle agent:", error);
        }
    }, [loadAgents]);
    // Get role badge color
    const getRoleColor = (role) => {
        const colors = {
            operator: "bg-blue-500",
            developer: "bg-green-500",
            analyst: "bg-yellow-500",
            manager: "bg-purple-500",
            creator: "bg-pink-500",
            admin: "bg-red-500",
        };
        return colors[role] || "bg-gray-500";
    };
    // Get health badge
    const getHealthBadge = (health) => {
        const configs = {
            healthy: { label: "Healthy", className: "badge-success" },
            warning: { label: "Idle", className: "badge-warning" },
            error: { label: "Error", className: "badge-error" },
            unknown: { label: "Unknown", className: "badge-info" },
        };
        return configs[health];
    };
    if (loading) {
        return (_jsx("div", { className: "p-8 flex items-center justify-center", children: _jsx("div", { className: "animate-spin w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" }) }));
    }
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Agents" }), _jsx("p", { className: "text-[var(--color-text-muted)]", children: "Manage your AI agents and their configurations" })] }), _jsxs("button", { onClick: handleCreateAgent, className: "btn-primary", children: [_jsx("span", { className: "mr-2", children: "+" }), "Create Agent"] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6", children: [_jsx(StatCard, { label: "Total Agents", value: agents.length, icon: "\uD83E\uDD16" }), _jsx(StatCard, { label: "Running", value: agents.filter((a) => a.state === AgentState.ACTIVE).length, icon: "\u25B6\uFE0F", color: "text-green-500" }), _jsx(StatCard, { label: "Active Sessions", value: agents.reduce((sum, a) => sum + a.sessionCount, 0), icon: "\uD83D\uDCAC", color: "text-blue-500" }), _jsx(StatCard, { label: "Errors", value: agents.filter((a) => a.health === "error").length, icon: "\u26A0\uFE0F", color: "text-red-500" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 mb-6", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]", children: "\uD83D\uDD0D" }), _jsx("input", { type: "text", value: filter.search, onChange: (e) => setFilter((prev) => ({ ...prev, search: e.target.value })), placeholder: "Search agents...", className: "w-full pl-10 pr-4 py-2 input" })] }), _jsxs("select", { value: filter.status || "", onChange: (e) => setFilter((prev) => ({ ...prev, status: e.target.value || null })), className: "select", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: AgentState.ACTIVE, children: "Active" }), _jsx("option", { value: AgentState.IDLE, children: "Idle" }), _jsx("option", { value: AgentState.SUSPENDED, children: "Suspended" }), _jsx("option", { value: AgentState.ERROR, children: "Error" })] }), _jsxs("select", { value: `${filter.sortBy}-${filter.sortOrder}`, onChange: (e) => {
                            const [sortBy, sortOrder] = e.target.value.split("-");
                            setFilter((prev) => ({ ...prev, sortBy, sortOrder }));
                        }, className: "select", children: [_jsx("option", { value: "name-asc", children: "Name A-Z" }), _jsx("option", { value: "name-desc", children: "Name Z-A" }), _jsx("option", { value: "date-desc", children: "Recently Active" }), _jsx("option", { value: "usage-desc", children: "Most Used" })] })] }), filteredAgents.length === 0 ? (_jsx(EmptyState, { onCreate: handleCreateAgent })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredAgents.map((agent) => (_jsx(AgentCard, { agent: agent, roleColor: getRoleColor(agent.config.role), healthBadge: getHealthBadge(agent.health), onEdit: () => handleEditAgent(agent.config), onDelete: () => handleDeleteAgent(agent.config.id), onToggle: () => handleToggleAgent(agent.config.id, agent.state || AgentState.IDLE) }, agent.config.id))) })), modal.isOpen && (_jsx(AgentModal, { type: modal.type, agent: selectedAgent, onClose: () => {
                    setModal({ isOpen: false, type: null });
                    setSelectedAgent(null);
                }, onSave: loadAgents }))] }));
};
// ... (StatCard, EmptyState components same as before)
const AgentCard = ({ agent, roleColor, healthBadge, onEdit, onDelete, onToggle, }) => {
    const isRunning = agent.state === AgentState.ACTIVE || agent.state === AgentState.THINKING;
    return (_jsxs("div", { className: "card-hover group", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-3 h-3 rounded-full flex-shrink-0 mt-1 ${roleColor}` }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold truncate max-w-[160px]", children: agent.config.name }), _jsx("p", { className: "text-xs text-[var(--color-text-muted)] capitalize", children: agent.config.role })] })] }), _jsx("span", { className: healthBadge.className, children: healthBadge.label })] }), _jsxs("div", { className: "text-sm text-[var(--color-text-muted)] mb-3 space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2 truncate", children: [_jsx("span", { children: "\uD83E\uDDE0" }), _jsx("span", { className: "truncate", children: agent.config.model })] }), _jsxs("div", { className: "flex items-center gap-2 truncate", children: [_jsx("span", { children: "\uD83D\uDCC1" }), _jsx("span", { className: "truncate", children: agent.config.workspace })] })] }), agent.config.capabilities.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-1 mb-3", children: [agent.config.capabilities.slice(0, 3).map((cap) => (_jsx("span", { className: "badge bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] capitalize", children: cap }, cap))), agent.config.capabilities.length > 3 && (_jsxs("span", { className: "badge bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]", children: ["+", agent.config.capabilities.length - 3] }))] })), _jsxs("div", { className: "flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-4", children: [_jsxs("div", { className: "flex gap-3", children: [_jsxs("span", { title: "Skills", children: ["\uD83C\uDFAF ", agent.config.skills.length] }), _jsxs("span", { title: "Tools", children: ["\uD83D\uDD27 ", agent.config.tools.length] })] }), _jsx("span", { title: "Last active", children: agent.lastActive ? new Date(agent.lastActive).toLocaleDateString() : "—" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: onToggle, className: "btn-secondary flex-1", children: isRunning ? "Pause" : "Start" }), _jsx("button", { onClick: onEdit, className: "btn-secondary", title: "Edit", children: "\u270F\uFE0F" }), _jsx("button", { onClick: onDelete, className: "btn-secondary text-red-500", title: "Delete", children: "\uD83D\uDDD1\uFE0F" })] })] }));
};
const AgentModal = ({ type, agent, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        role: AgentRole.DEVELOPER,
        model: "llama3.2",
        capabilities: [AgentCapability.REASONING],
        workspace: "./workspace",
        skills: [],
        tools: [],
        ...agent,
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (type === "create") {
                await agentManager.spawnAgent(formData);
            }
            else if (type === "edit" && agent) {
                // Mock update for now
                console.log("Update agent", formData);
            }
            onSave();
            onClose();
        }
        catch (error) {
            console.error("Failed to save agent:", error);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50", children: _jsxs("div", { className: "bg-[var(--color-surface)] p-6 rounded-lg w-full max-w-lg", children: [_jsxs("h2", { className: "text-xl font-bold mb-4", children: [type === "create" ? "Create" : "Edit", " Agent"] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx("input", { className: "input w-full", placeholder: "Agent Name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }) }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "btn-secondary", children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary", children: "Save" })] })] })] }) }));
};
export default AgentDashboard;
