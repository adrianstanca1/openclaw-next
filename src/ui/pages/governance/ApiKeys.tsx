// OpenClaw Next - API Keys Management Page
// Manage API access keys

import { Plus, Trash2, Copy, Check } from "lucide-react";
import React, { useState } from "react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
}

export const ApiKeys: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mock API keys data - will be replaced with API data
  const apiKeys: ApiKey[] = [
    {
      id: "key-1",
      name: "Production Key",
      key: "oc_key_prod_xxxxxxxxxxxxxxxxxxxxxxxx",
      permissions: ["read", "write", "admin"],
      lastUsed: new Date(Date.now() - 120000).toISOString(),
      createdAt: new Date(Date.now() - 2592000000).toISOString(),
    },
    {
      id: "key-2",
      name: "Staging Key",
      key: "oc_key_staging_xxxxxxxxxxxxxxxxxxxx",
      permissions: ["read", "write"],
      lastUsed: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 1728000000).toISOString(),
    },
    {
      id: "key-3",
      name: "Development",
      key: "oc_key_dev_xxxxxxxxxxxxxxxxxxxxxxx",
      permissions: ["read"],
      lastUsed: new Date(Date.now() - 259200000).toISOString(),
      createdAt: new Date(Date.now() - 864000000).toISOString(),
    },
  ];

  const handleCopy = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatLastUsed = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="p-8 space-y-6 bg-[var(--color-bg)] text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-slate-400 mt-1">Manage API access keys</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>Create Key</span>
        </button>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold">{apiKey.name}</h3>
                  <div className="flex gap-1">
                    {apiKey.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <code className="text-slate-400 text-sm font-mono bg-slate-800 px-3 py-1.5 rounded">
                    {apiKey.key.substring(0, 12)}...{apiKey.key.substring(apiKey.key.length - 4)}
                  </code>
                  <button
                    onClick={() => handleCopy(apiKey.key, apiKey.id)}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                    title="Copy full key"
                  >
                    {copiedId === apiKey.id ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="text-slate-400 text-sm">
                  Last used:{" "}
                  <span className="text-slate-300">{formatLastUsed(apiKey.lastUsed)}</span>
                </p>
                {apiKey.expiresAt && (
                  <p className="text-slate-500 text-xs mt-1">
                    Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <button className="ml-4 p-2 text-slate-400 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {apiKeys.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🔑</div>
          <h3 className="text-white font-semibold mb-2">No API Keys</h3>
          <p className="text-slate-400">Create your first API key</p>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;
