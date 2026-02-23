/**
 * OpenClaw Next - Plugins View
 * Manage plugins using the PluginManager
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { pluginManager } from '../plugins/manager.js';
import type { InstalledPlugin, PluginState, PluginSource, PluginCategory } from '../plugins/types.js';

interface PluginCardData {
  plugin: InstalledPlugin;
  hookCount: number;
  eventCount: number;
  dependenciesSatisfied: boolean;
}

interface FilterState {
  search: string;
  category: PluginCategory | null;
  source: PluginSource | null;
  status: PluginState | null;
  sortBy: 'name' | 'date' | 'status';
  sortOrder: 'asc' | 'desc';
}

/**
 * Plugins View Component
 * Displays and manages installed plugins
 */
export const PluginsView: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    category: null,
    source: null,
    status: null,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [selectedPlugin, setSelectedPlugin] = useState<InstalledPlugin | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Load plugins on mount
  useEffect(() => {
    loadPlugins();

    // Subscribe to plugin events
    const listener = (event: any) => {
      console.log('Plugin enabled:', event.pluginId);
      loadPlugins();
    };
    pluginManager.on('plugin_enabled', listener);

    return () => {
      pluginManager.off('plugin_enabled', listener);
    };
  }, []);

  const loadPlugins = useCallback(async () => {
    setLoading(true);
    try {
      const allInstances = (pluginManager as any).registry.getAllInstances() as InstalledPlugin[];
      const pluginData: PluginCardData[] = allInstances.map((plugin) => {
        return {
          plugin,
          hookCount: plugin.hooks?.length || 0,
          eventCount: (plugin as any).events?.length || 0,
          dependenciesSatisfied: plugin.dependenciesSatisfied || false,
        };
      });
      setPlugins(pluginData);
    } catch (error) {
      console.error('Failed to load plugins:', error);
      setPlugins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort plugins
  const filteredPlugins = useMemo(() => {
    let result = [...plugins];

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.plugin.name.toLowerCase().includes(searchLower) ||
          p.plugin.description.toLowerCase().includes(searchLower) ||
          p.plugin.id.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filter.category) {
      result = result.filter((p) =>
        p.plugin.metadata?.category === filter.category
      );
    }

    // Source filter
    if (filter.source) {
      result = result.filter((p) => p.plugin.source === filter.source);
    }

    // Status filter
    if (filter.status) {
      result = result.filter((p) => p.plugin.state === filter.status);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (filter.sortBy) {
        case 'name':
          comparison = a.plugin.name.localeCompare(b.plugin.name);
          break;
        case 'date':
          comparison =
            new Date(b.plugin.installedAt).getTime() -
            new Date(a.plugin.installedAt).getTime();
          break;
        case 'status':
          comparison = a.plugin.state.localeCompare(b.plugin.state);
          break;
      }
      return filter.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [plugins, filter]);

  // Toggle plugin
  const handleTogglePlugin = useCallback(async (instanceId: string, currentState: PluginState) => {
    setIsProcessing(instanceId);
    try {
      if (currentState === 'enabled') {
        await pluginManager.disablePlugin(instanceId);
      } else {
        await pluginManager.enablePlugin(instanceId);
      }
      await loadPlugins();
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
    } finally {
      setIsProcessing(null);
    }
  }, [loadPlugins]);

  // Hot reload plugin
  const handleHotReload = useCallback(async (instanceId: string) => {
    setIsProcessing(instanceId);
    try {
      await pluginManager.hotReload(instanceId);
      await loadPlugins();
    } catch (error) {
      console.error('Failed to hot reload plugin:', error);
    } finally {
      setIsProcessing(null);
    }
  }, [loadPlugins]);

  // Get status badge
  const getStatusBadge = (state: PluginState) => {
    const configs: Record<PluginState, { label: string; className: string }> = {
      installed: { label: 'Installed', className: 'badge-info' },
      enabled: { label: 'Enabled', className: 'badge-success' },
      disabled: { label: 'Disabled', className: 'badge-error' },
      error: { label: 'Error', className: 'badge-error' },
      loading: { label: 'Loading', className: 'badge-warning' },
      uninstalling: { label: 'Uninstalling', className: 'badge-warning' },
    };
    return configs[state] || configs.disabled;
  };

  // Get source icon
  const getSourceIcon = (source: PluginSource): string => {
    const icons: Record<PluginSource, string> = {
      local: '📁',
      remote: '🌐',
      bundled: '📦',
      marketplace: '🏪',
      builtin: '🔧',
    };
    return icons[source] || '🔧';
  };

  // Plugin categories
  const categories: PluginCategory[] = [
    'monitoring',
    'logging',
    'analytics',
    'security',
    'automation',
    'integration',
    'notification',
    'cache',
    'storage',
    'optimization',
    'experimental',
  ];

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
          <h1 className="text-2xl font-bold">Plugins</h1>
          <p className="text-[var(--color-text-muted)]">
            Manage system plugins and extensions
          </p>
        </div>
        <button className="btn-primary">
          <span className="mr-2">+</span>
          Install Plugin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Plugins" value={plugins.length} icon="🔌" />
        <StatCard
          label="Enabled"
          value={plugins.filter((p) => p.plugin.state === 'enabled').length}
          icon="✅"
          color="text-green-500"
        />
        <StatCard
          label="Disabled"
          value={plugins.filter((p) => p.plugin.state === 'disabled').length}
          icon="❌"
          color="text-red-500"
        />
        <StatCard
          label="With Errors"
          value={plugins.filter((p) => p.plugin.state === 'error').length}
          icon="⚠️"
          color="text-yellow-500"
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
            placeholder="Search plugins..."
            className="w-full pl-10 pr-4 py-2 input"
          />
        </div>

        <select
          value={filter.status || ''}
          onChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              status: (e.target.value as PluginState) || null,
            }))
          }
          className="select"
        >
          <option value="">All Status</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
          <option value="error">Error</option>
          <option value="installed">Installed</option>
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
          <option value="date-desc">Recently Installed</option>
          <option value="status-asc">By Status</option>
        </select>
      </div>

      {/* Plugins Grid */}
      {filteredPlugins.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlugins.map((pluginData) => (
            <PluginCard
              key={pluginData.plugin.instanceId}
              pluginData={pluginData}
              statusBadge={getStatusBadge(pluginData.plugin.state)}
              sourceIcon={getSourceIcon(pluginData.plugin.source)}
              isProcessing={isProcessing === pluginData.plugin.instanceId}
              onToggle={() =>
                handleTogglePlugin(pluginData.plugin.instanceId, pluginData.plugin.state)
              }
              onHotReload={() => handleHotReload(pluginData.plugin.instanceId)}
              onSelect={() => setSelectedPlugin(pluginData.plugin)}
            />
          ))}
        </div>
      )}

      {/* Plugin Detail Modal */}
      {selectedPlugin && (
        <PluginDetailModal
          plugin={selectedPlugin}
          onClose={() => setSelectedPlugin(null)}
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
    <div className="text-6xl mb-4">🔌</div>
    <h3 className="text-xl font-bold mb-2">No Plugins Installed</h3>
    <p className="text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
      Install your first plugin to extend OpenClaw's functionality
    </p>
    <button className="btn-primary">
      <span className="mr-2">+</span>
      Browse Marketplace
    </button>
  </div>
);

/**
 * Plugin Card Component
 */
interface PluginCardProps {
  pluginData: PluginCardData;
  statusBadge: { label: string; className: string };
  sourceIcon: string;
  isProcessing: boolean;
  onToggle: () => void;
  onHotReload: () => void;
  onSelect: () => void;
}

const PluginCard: React.FC<PluginCardProps> = ({
  pluginData,
  statusBadge,
  sourceIcon,
  isProcessing,
  onToggle,
  onHotReload,
  onSelect,
}) => {
  const { plugin, hookCount, eventCount } = pluginData;
  const isEnabled = plugin.state === 'enabled';

  return (
    <div className="card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[var(--color-surface-hover)] rounded-lg flex items-center justify-center text-2xl">
            {plugin.metadata?.icon || sourceIcon}
          </div>
          <div>
            <h3 className="font-semibold truncate max-w-[150px]">{plugin.name}</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              v{plugin.version}
            </p>
          </div>
        </div>
        <span className={statusBadge.className}>{statusBadge.label}</span>
      </div>

      <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">
        {plugin.description}
      </p>

      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-4">
        <div className="flex gap-3">
          <span title="Hooks">🪝 {hookCount}</span>
          <span title="Events">📡 {eventCount}</span>
        </div>
        <span>{sourceIcon} {plugin.source}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onToggle}
          disabled={isProcessing}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
            isEnabled
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
              : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
          }`}
        >
          {isProcessing ? '⏳' : isEnabled ? 'Disable' : 'Enable'}
        </button>
        {isEnabled && plugin.hotReloadable && (
          <button
            onClick={onHotReload}
            disabled={isProcessing}
            className="py-2 px-3 rounded-lg text-sm font-medium bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
          >
            🔄
          </button>
        )}
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
 * Plugin Detail Modal
 */
interface PluginDetailModalProps {
  plugin: InstalledPlugin;
  onClose: () => void;
}

const PluginDetailModal: React.FC<PluginDetailModalProps> = ({ plugin, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[var(--color-surface-hover)] rounded-lg flex items-center justify-center text-4xl">
                {plugin.metadata?.icon || '🔌'}
              </div>
              <div>
                <h2 className="text-xl font-bold">{plugin.name}</h2>
                <p className="text-sm text-[var(--color-text-muted)]">{plugin.id}</p>
                <div className="flex gap-2 mt-1">
                  <span className="badge-info">v{plugin.version}</span>
                  <span className="badge">{plugin.state}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-2xl hover:text-[var(--color-primary)]">
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-[var(--color-text-muted)]">
              {plugin.longDescription || plugin.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Author</h3>
              <p className="text-[var(--color-text-muted)]">{plugin.author || 'Unknown'}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">License</h3>
              <p className="text-[var(--color-text-muted)]">{plugin.license || 'MIT'}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Installed</h3>
              <p className="text-[var(--color-text-muted)]">
                {new Date(plugin.installedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Source</h3>
              <p className="text-[var(--color-text-muted)] capitalize">{plugin.source}</p>
            </div>
          </div>

          {plugin.metadata?.tags && plugin.metadata.tags.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {plugin.metadata.tags.map((tag: string) => (
                  <span key={tag} className="badge">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {plugin.hooks && plugin.hooks.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Registered Hooks</h3>
              <div className="bg-[var(--color-bg)] rounded-lg p-4 space-y-2">
                {plugin.hooks.map((hook: any, index: number) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{hook.name}</span>
                    <span className="text-[var(--color-text-muted)]">
                      {' '}→ {hook.trigger}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plugin.config && Object.keys(plugin.config).length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Configuration</h3>
              <pre className="bg-[var(--color-bg)] p-4 rounded-lg text-sm overflow-x-auto">
                <code>{JSON.stringify(plugin.config, null, 2)}</code>
              </pre>
            </div>
          )}

          {plugin.lastError && (
            <div className="p-4 bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-lg">
              <h3 className="font-medium mb-2 text-[var(--color-error)]">Last Error</h3>
              <p className="text-sm text-[var(--color-error)]">
                {plugin.lastError.message}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[var(--color-border)] flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PluginsView;
