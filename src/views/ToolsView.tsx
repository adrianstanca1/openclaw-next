/**
 * OpenClaw Next - Tools View
 * Display and manage available tools from the ToolRegistry
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toolRegistry } from '../tools/registry.js';
import type { ToolDefinition, ToolCategory, ToolStatus } from '../tools/types.js';

interface ToolCardData {
  definition: ToolDefinition;
  status: ToolStatus;
  usageCount: number;
}

interface FilterState {
  search: string;
  category: ToolCategory | null;
  status: ToolStatus | null;
  sortBy: 'name' | 'usage' | 'category';
  sortOrder: 'asc' | 'desc';
}

/**
 * Tools View Component
 * Displays and manages available tools
 */
export const ToolsView: React.FC = () => {
  const [tools, setTools] = useState<ToolCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    category: null,
    status: null,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);

  // Load tools on mount
  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = useCallback(() => {
    setLoading(true);
    try {
      const allTools = toolRegistry.list({ includeDisabled: true });
      const toolData: ToolCardData[] = allTools.map((definition) => {
        const status = toolRegistry.getStatus(definition.id) || 'enabled';
        return {
          definition,
          status,
          usageCount: 0, // Would track from actual usage
        };
      });
      setTools(toolData);
    } catch (error) {
      console.error('Failed to load tools:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let result = [...tools];

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        (tool) =>
          tool.definition.name.toLowerCase().includes(searchLower) ||
          tool.definition.description.toLowerCase().includes(searchLower) ||
          tool.definition.id.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filter.category) {
      result = result.filter((tool) => tool.definition.category === filter.category);
    }

    // Status filter
    if (filter.status) {
      result = result.filter((tool) => tool.status === filter.status);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (filter.sortBy) {
        case 'name':
          comparison = a.definition.name.localeCompare(b.definition.name);
          break;
        case 'usage':
          comparison = b.usageCount - a.usageCount;
          break;
        case 'category':
          comparison = (a.definition.category || '').localeCompare(b.definition.category || '');
          break;
      }
      return filter.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tools, filter]);

  // Toggle tool status
  const handleToggleTool = useCallback(async (toolId: string, currentStatus: ToolStatus) => {
    try {
      const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
      toolRegistry.updateStatus(toolId, newStatus);
      loadTools();
    } catch (error) {
      console.error('Failed to toggle tool:', error);
    }
  }, [loadTools]);

  // Get category icon
  const getCategoryIcon = (category: ToolCategory): string => {
    const icons: Record<ToolCategory, string> = {
      web: '🌐',
      search: '🔍',
      computation: '🧮',
      storage: '💾',
      communication: '💬',
      automation: '⚡',
      ai: '🤖',
      system: '⚙️',
      custom: '🔧',
    };
    return icons[category] || '🔧';
  };

  // Get status badge
  const getStatusBadge = (status: ToolStatus) => {
    const configs: Record<ToolStatus, { label: string; className: string }> = {
      enabled: { label: 'Enabled', className: 'badge-success' },
      disabled: { label: 'Disabled', className: 'badge-error' },
      unavailable: { label: 'Unavailable', className: 'badge-warning' },
      rate_limited: { label: 'Rate Limited', className: 'badge-warning' },
      cost_exceeded: { label: 'Cost Exceeded', className: 'badge-error' },
      pending_approval: { label: 'Pending', className: 'badge-info' },
    };
    return configs[status] || configs.disabled;
  };

  // Tool categories
  const categories: ToolCategory[] = ['web', 'search', 'computation', 'storage', 'communication', 'automation', 'ai', 'system', 'custom'];

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
          <h1 className="text-2xl font-bold">Tools</h1>
          <p className="text-[var(--color-text-muted)]">
            Manage available tools for your agents
          </p>
        </div>
        <div className="text-sm text-[var(--color-text-muted)]">
          {tools.filter((t) => t.status === 'enabled').length} / {tools.length} enabled
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tools" value={tools.length} icon="🛠️" />
        <StatCard
          label="Enabled"
          value={tools.filter((t) => t.status === 'enabled').length}
          icon="✅"
          color="text-green-500"
        />
        <StatCard
          label="Disabled"
          value={tools.filter((t) => t.status === 'disabled').length}
          icon="❌"
          color="text-red-500"
        />
        <StatCard
          label="Categories"
          value={new Set(tools.map((t) => t.definition.category)).size}
          icon="📂"
          color="text-blue-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            🔍
          </span>
          <input
            type="text"
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search tools..."
            className="w-full pl-10 pr-4 py-2 input"
          />
        </div>

        <select
          value={filter.category || ''}
          onChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              category: (e.target.value as ToolCategory) || null,
            }))
          }
          className="select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filter.status || ''}
          onChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              status: (e.target.value as ToolStatus) || null,
            }))
          }
          className="select"
        >
          <option value="">All Status</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <select
          value={`${filter.sortBy}-${filter.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-') as [
              FilterState['sortBy'],
              FilterState['sortOrder']
            ];
            setFilter((prev) => ({ ...prev, sortBy, sortOrder }));
          }}
          className="select"
        >
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="usage-desc">Most Used</option>
          <option value="category-asc">Category</option>
        </select>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.definition.id}
              tool={tool}
              categoryIcon={getCategoryIcon(tool.definition.category)}
              statusBadge={getStatusBadge(tool.status)}
              onToggle={() => handleToggleTool(tool.definition.id, tool.status)}
              onSelect={() => setSelectedTool(tool.definition)}
            />
          ))}
        </div>
      )}

      {/* Tool Detail Modal */}
      {selectedTool && (
        <ToolDetailModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
        />
      )}
    </div>
  );
};

/**
 * Stat Card Component
 */
interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
        <p className={`text-2xl font-bold ${color || ''}`}>{value}</p>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);

/**
 * Empty State Component
 */
const EmptyState: React.FC = () => (
  <div className="text-center py-16 card">
    <div className="text-6xl mb-4">🛠️</div>
    <h3 className="text-xl font-bold mb-2">No Tools Found</h3>
    <p className="text-[var(--color-text-muted)] max-w-md mx-auto">
      No tools match your current filters. Try adjusting your search or filters.
    </p>
  </div>
);

/**
 * Tool Card Component
 */
interface ToolCardProps {
  tool: ToolCardData;
  categoryIcon: string;
  statusBadge: { label: string; className: string };
  onToggle: () => void;
  onSelect: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  categoryIcon,
  statusBadge,
  onToggle,
  onSelect,
}) => {
  const isEnabled = tool.status === 'enabled';

  return (
    <div className="card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[var(--color-surface-hover)] rounded-lg flex items-center justify-center text-2xl">
            {categoryIcon}
          </div>
          <div>
            <h3 className="font-semibold truncate max-w-[150px]">{tool.definition.name}</h3>
            <p className="text-sm text-[var(--color-text-muted)] capitalize">
              {tool.definition.category}
            </p>
          </div>
        </div>
        <span className={statusBadge.className}>{statusBadge.label}</span>
      </div>

      <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">
        {tool.definition.description}
      </p>

      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-4">
        <span>ID: {tool.definition.id}</span>
        {tool.definition.metadata?.version && (
          <span>v{tool.definition.metadata.version}</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onToggle}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            isEnabled
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
              : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
          }`}
        >
          {isEnabled ? 'Disable' : 'Enable'}
        </button>
        <button
          onClick={onSelect}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Details
        </button>
      </div>
    </div>
  );
};

/**
 * Tool Detail Modal
 */
interface ToolDetailModalProps {
  tool: ToolDefinition;
  onClose: () => void;
}

const ToolDetailModal: React.FC<ToolDetailModalProps> = ({ tool, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] w-full max-lg max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{tool.name}</h2>
            <button onClick={onClose} className="text-2xl hover:text-[var(--color-primary)]">
              ×
            </button>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{tool.id}</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-[var(--color-text-muted)]">{tool.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Category</h3>
              <span className="badge-info capitalize">{tool.category}</span>
            </div>
            <div>
              <h3 className="font-medium mb-2">Version</h3>
              <span className="text-[var(--color-text-muted)]">
                {tool.metadata?.version || '1.0.0'}
              </span>
            </div>
          </div>

          {tool.metadata?.tags && tool.metadata.tags.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tool.metadata.tags.map((tag) => (
                  <span key={tag} className="badge">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Schema</h3>
            <pre className="bg-[var(--color-bg)] p-4 rounded-lg text-sm overflow-x-auto">
              <code>{JSON.stringify(tool.schema, null, 2)}</code>
            </pre>
          </div>

          {tool.metadata?.examples && tool.metadata.examples.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Examples</h3>
              <div className="space-y-2">
                {tool.metadata.examples.map((example, index) => (
                  <div key={index} className="bg-[var(--color-bg)] p-4 rounded-lg">
                    <p className="text-sm text-[var(--color-text-muted)] mb-2">
                      {example.description}
                    </p>
                    <code className="text-xs block">
                      Input: {JSON.stringify(example.input)}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[var(--color-border)] flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolsView;
