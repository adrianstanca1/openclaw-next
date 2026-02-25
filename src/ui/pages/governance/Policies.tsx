// OpenClaw Next - Policies Management Page
// Configure governance policies

import React, { useState } from 'react';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';

interface Policy {
  id: string;
  name: string;
  description: string;
  type: 'approval' | 'rate_limit' | 'access' | 'resource';
  active: boolean;
  rules: Record<string, unknown>;
  createdAt: string;
}

export const Policies: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: 'policy-1',
      name: 'Approval Required',
      description: 'Require approval for agent spawning and skill installation',
      type: 'approval',
      active: true,
      rules: {
        requireApprovalFor: ['agent_spawn', 'skill_install'],
        approvers: ['admin', 'lead']
      },
      createdAt: new Date(Date.now() - 2592000000).toISOString()
    },
    {
      id: 'policy-2',
      name: 'Rate Limiting',
      description: 'Limit API requests to prevent abuse',
      type: 'rate_limit',
      active: true,
      rules: {
        requestsPerMinute: 100,
        requestsPerHour: 1000,
        burstLimit: 20
      },
      createdAt: new Date(Date.now() - 1728000000).toISOString()
    },
    {
      id: 'policy-3',
      name: 'Resource Quota',
      description: 'Limit concurrent agents and resource usage',
      type: 'resource',
      active: false,
      rules: {
        maxConcurrentAgents: 20,
        maxMemoryPerAgent: '2GB',
        maxCpuPerAgent: '2 cores'
      },
      createdAt: new Date(Date.now() - 864000000).toISOString()
    }
  ]);

  const togglePolicy = (id: string) => {
    setPolicies(policies.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'approval': return 'bg-yellow-500/20 text-yellow-400';
      case 'rate_limit': return 'bg-blue-500/20 text-blue-400';
      case 'access': return 'bg-purple-500/20 text-purple-400';
      case 'resource': return 'bg-green-500/20 text-green-400';
      default: return 'bg-slate-700 text-slate-400';
    }
  };

  return (
    <div className="p-8 space-y-6 bg-[var(--color-bg)] text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Policies</h1>
          <p className="text-slate-400 mt-1">Configure governance policies</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>Create Policy</span>
        </button>
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-lg ${
                  policy.active ? 'bg-indigo-500/20' : 'bg-slate-700/50'
                }`}>
                  <Shield className={`w-6 h-6 ${
                    policy.active ? 'text-indigo-400' : 'text-slate-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold text-lg">{policy.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      policy.active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {policy.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(policy.type)}`}>
                      {policy.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">{policy.description}</p>

                  {/* Policy Rules Preview */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(policy.rules).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="px-3 py-1.5 bg-slate-800 rounded text-xs">
                        <span className="text-slate-500">{key}:</span>{' '}
                        <span className="text-slate-300">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Toggle Switch */}
                <button
                  onClick={() => togglePolicy(policy.id)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    policy.active ? 'bg-indigo-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    policy.active ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {policies.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🛡️</div>
          <h3 className="text-white font-semibold mb-2">No Policies</h3>
          <p className="text-slate-400">Create your first governance policy</p>
        </div>
      )}
    </div>
  );
};

export default Policies;
