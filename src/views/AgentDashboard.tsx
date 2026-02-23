// OpenClaw Next - Agent Dashboard View
// Display and manage agents using the AgentManager

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { agentManager } from '../agents/index.js';
import { AgentRole, AgentCapability, type AgentConfig } from '../core/types.js';
import { AgentState } from '../agents/types.js';
import type { AgentCardData, FilterState, ModalState } from '../ui/types.js';
import { StatCard } from '../ui/components/StatCard.js';
import { EmptyState } from '../ui/components/EmptyState.js';

/**
 * Agent Dashboard View
 * Main interface for viewing and managing agents
 */
export const AgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<AgentCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    category: null,
    status: null,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: null,
  });
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);

  // Load agents on mount
  useEffect(() => {
    loadAgents();
  }, []);

  // Load agents from manager
  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const agentList = agentManager.getAllAgents();
      const agentData: AgentCardData[] = agentList.map((instance) => {
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
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate agent health based on state
  const calculateHealth = (state?: AgentState): AgentCardData['health'] => {
    if (!state) return 'unknown';
    if (state === AgentState.ERROR) return 'error';
    if (state === AgentState.ACTIVE || state === AgentState.THINKING || state === AgentState.ACTING) return 'healthy';
    if (state === AgentState.IDLE) return 'healthy';
    if (state === AgentState.WAITING || state === AgentState.SUSPENDED) return 'warning';
    return 'unknown';
  };

  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    let result = [...agents];

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        (agent) =>
          agent.config.name.toLowerCase().includes(searchLower) ||
          agent.config.role.toLowerCase().includes(searchLower) ||
          agent.config.id.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filter.status) {
      result = result.filter((agent) => agent.state === filter.status);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (filter.sortBy) {
        case 'name':
          comparison = a.config.name.localeCompare(b.config.name);
          break;
        case 'date':
          comparison =
            new Date(b.lastActive || 0).getTime() -
            new Date(a.lastActive || 0).getTime();
          break;
        case 'usage':
          comparison = b.sessionCount - a.sessionCount;
          break;
      }
      return filter.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [agents, filter]);

  // Create new agent
  const handleCreateAgent = useCallback(() => {
    setModal({ isOpen: true, type: 'create' });
  }, []);

  // Edit agent
  const handleEditAgent = useCallback((agent: AgentConfig) => {
    setSelectedAgent(agent);
    setModal({ isOpen: true, type: 'edit' });
  }, []);

  // Delete agent
  const handleDeleteAgent = useCallback(
    async (agentId: string) => {
      if (window.confirm('Are you sure you want to delete this agent?')) {
        try {
          await agentManager.terminateAgent(agentId); // Corrected method
          await loadAgents();
        } catch (error) {
          console.error('Failed to delete agent:', error);
          alert('Failed to delete agent');
        }
      }
    },
    [loadAgents]
  );

  // Pause/Resume agent
  const handleToggleAgent = useCallback(
    async (agentId: string, currentState: AgentState) => {
      try {
        if (currentState === AgentState.ACTIVE || currentState === AgentState.THINKING) {
          await agentManager.suspendAgent(agentId); // Corrected method
        } else {
          await agentManager.resumeAgent(agentId);
        }
        await loadAgents();
      } catch (error) {
        console.error('Failed to toggle agent:', error);
      }
    },
    [loadAgents]
  );

  // Get role badge color
  const getRoleColor = (role: AgentRole): string => {
    const colors: Record<AgentRole, string> = {
      operator: 'bg-blue-500',
      developer: 'bg-green-500',
      analyst: 'bg-yellow-500',
      manager: 'bg-purple-500',
      creator: 'bg-pink-500',
      admin: 'bg-red-500',
    };
    return colors[role] || 'bg-gray-500';
  };

  // Get health badge
  const getHealthBadge = (health: AgentCardData['health']) => {
    const configs = {
      healthy: { label: 'Healthy', className: 'badge-success' },
      warning: { label: 'Idle', className: 'badge-warning' },
      error: { label: 'Error', className: 'badge-error' },
      unknown: { label: 'Unknown', className: 'badge-info' },
    };
    return configs[health];
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="text-[var(--color-text-muted)]">
            Manage your AI agents and their configurations
          </p>
        </div>
        <button onClick={handleCreateAgent} className="btn-primary">
          <span className="mr-2">+</span>
          Create Agent
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Agents" value={agents.length} icon="🤖" />
        <StatCard
          label="Running"
          value={agents.filter((a) => a.state === AgentState.ACTIVE).length}
          icon="▶️"
          color="text-green-500"
        />
        <StatCard
          label="Active Sessions"
          value={agents.reduce((sum, a) => sum + a.sessionCount, 0)}
          icon="💬"
          color="text-blue-500"
        />
        <StatCard
          label="Errors"
          value={agents.filter((a) => a.health === 'error').length}
          icon="⚠️"
          color="text-red-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* ... (Filters code same as before, simplified for brevity) ... */}
      </div>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <EmptyState onCreate={handleCreateAgent} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.config.id}
              agent={agent}
              roleColor={getRoleColor(agent.config.role)}
              healthBadge={getHealthBadge(agent.health)}
              onEdit={() => handleEditAgent(agent.config)}
              onDelete={() => handleDeleteAgent(agent.config.id)}
              onToggle={() =>
                handleToggleAgent(agent.config.id, agent.state || AgentState.IDLE)
              }
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal.isOpen && (
        <AgentModal
          type={modal.type}
          agent={selectedAgent}
          onClose={() => {
            setModal({ isOpen: false, type: null });
            setSelectedAgent(null);
          }}
          onSave={loadAgents}
        />
      )}
    </div>
  );
};

// ... (StatCard, EmptyState components same as before)

const AgentCard: React.FC<any> = ({ agent, roleColor, healthBadge, onEdit, onDelete, onToggle }) => {
  const isRunning = agent.state === AgentState.ACTIVE || agent.state === AgentState.THINKING;
  
  return (
    <div className="card-hover group">
      {/* ... (Card implementation) ... */}
      <div className="flex gap-2 mt-4">
        <button onClick={onToggle} className="btn-secondary flex-1">
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={onEdit} className="btn-secondary">✏️</button>
        <button onClick={onDelete} className="btn-secondary text-red-500">🗑️</button>
      </div>
    </div>
  );
};

interface AgentModalProps {
  type: 'create' | 'edit' | 'delete' | 'confirm' | null;
  agent: AgentConfig | null;
  onClose: () => void;
  onSave: () => void;
}

const AgentModal: React.FC<AgentModalProps> = ({
  type,
  agent,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<AgentConfig>>({
    name: '',
    role: AgentRole.DEVELOPER,
    model: 'llama3.2',
    capabilities: [AgentCapability.REASONING],
    workspace: './workspace',
    skills: [],
    tools: [],
    ...agent,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (type === 'create') {
        await agentManager.spawnAgent(formData as AgentConfig);
      } else if (type === 'edit' && agent) {
        // Mock update for now
        console.log('Update agent', formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save agent:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-[var(--color-surface)] p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{type === 'create' ? 'Create' : 'Edit'} Agent</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            className="input w-full" 
            placeholder="Agent Name"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentDashboard;
