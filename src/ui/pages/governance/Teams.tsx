// OpenClaw Next - Teams Management Page
// Manage teams and organizations

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Settings,
  Bot,
  Server,
  ChevronRight,
  Shield
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  agentCount: number;
  gatewayCount: number;
  createdAt: string;
  settings: {
    maxAgents: number;
    maxGateways: number;
    requireApprovalFor: string[];
    autoApprove: boolean;
  };
}

export const Teams: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  // Mock teams data - will be replaced with API data
  const displayTeams: Team[] = [
    {
      id: 'team-1',
      name: 'Engineering',
      description: 'Core engineering team with full access',
      memberCount: 12,
      agentCount: 8,
      gatewayCount: 2,
      createdAt: new Date(Date.now() - 2592000000).toISOString(),
      settings: {
        maxAgents: 20,
        maxGateways: 5,
        requireApprovalFor: ['agent_spawn', 'skill_install'],
        autoApprove: false
      }
    },
    {
      id: 'team-2',
      name: 'Data Science',
      description: 'Data processing and ML workloads',
      memberCount: 6,
      agentCount: 15,
      gatewayCount: 1,
      createdAt: new Date(Date.now() - 1728000000).toISOString(),
      settings: {
        maxAgents: 30,
        maxGateways: 3,
        requireApprovalFor: ['delegation'],
        autoApprove: true
      }
    },
    {
      id: 'team-3',
      name: 'DevOps',
      description: 'Infrastructure and automation',
      memberCount: 4,
      agentCount: 6,
      gatewayCount: 3,
      createdAt: new Date(Date.now() - 864000000).toISOString(),
      settings: {
        maxAgents: 15,
        maxGateways: 10,
        requireApprovalFor: [],
        autoApprove: true
      }
    }
  ];

  const team = selectedTeam
    ? displayTeams.find(t => t.id === selectedTeam)
    : null;

  return (
    <div className="p-8 space-y-6 bg-[var(--color-bg)] text-white">
      {!team ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Teams</h1>
              <p className="text-slate-400 mt-1">Manage teams and organizations</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span>Create Team</span>
            </button>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayTeams.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTeam(t.id)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 cursor-pointer hover:border-indigo-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-400" />
                  </div>
                  <button className="p-2 text-slate-500 hover:text-white">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-white font-semibold text-lg mb-1">{t.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{t.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-2xl font-bold text-white">{t.memberCount}</p>
                    <p className="text-slate-500 text-xs">Members</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{t.agentCount}</p>
                    <p className="text-slate-500 text-xs">Agents</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{t.gatewayCount}</p>
                    <p className="text-slate-500 text-xs">Gateways</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-slate-500 text-sm">
                    Created {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                  <button className="flex items-center gap-1 text-indigo-400 text-sm hover:text-indigo-300">
                    <span>Manage</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Team Detail View */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSelectedTeam(null)}
              className="text-slate-400 hover:text-white"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">{team.name}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Stats */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    <span className="text-slate-400">Members</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{team.memberCount}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Bot className="w-5 h-5 text-blue-400" />
                    <span className="text-slate-400">Agents</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{team.agentCount} / {team.settings.maxAgents}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Server className="w-5 h-5 text-green-400" />
                    <span className="text-slate-400">Gateways</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{team.gatewayCount} / {team.settings.maxGateways}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { action: 'Agent spawned', user: 'John Doe', time: '2 min ago' },
                    { action: 'Task completed', user: 'Agent-15', time: '5 min ago' },
                    { action: 'Settings updated', user: 'Jane Smith', time: '1 hour ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                        <span className="text-slate-300">{activity.action}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-sm">{activity.user}</p>
                        <p className="text-slate-500 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Team Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm">Auto-approve</label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className={`w-11 h-6 rounded-full ${team.settings.autoApprove ? 'bg-indigo-500' : 'bg-slate-700'} relative cursor-pointer`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${team.settings.autoApprove ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-slate-400 text-sm">{team.settings.autoApprove ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm">Require approval for:</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {team.settings.requireApprovalFor.length > 0 ? (
                      team.settings.requireApprovalFor.map((req) => (
                        <span key={req} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                          {req.replace('_', ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm">None</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                    Edit Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Teams;
