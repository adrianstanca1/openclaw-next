// OpenClaw Next - Gateway Management Page
// Manage OpenClaw gateways across regions

import React from 'react';
import {
  Server,
  Plus,
  MoreVertical,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface Gateway {
  id: string;
  name: string;
  region: string;
  endpoint: string;
  status: 'online' | 'offline' | 'degraded';
  version: string;
  uptime: number; // in hours
  connections: {
    active: number;
    total: number;
    websocket: number;
    http: number;
  };
  resources: {
    memory: number; // percentage
    cpu: number; // percentage
    requestsPerMinute: number;
  };
}

export const Gateways: React.FC = () => {
  // Mock gateways data - will be replaced with API data
  const gateways: Gateway[] = [
    {
      id: 'gw-1',
      name: 'US-East-1',
      region: 'us-east-1',
      endpoint: 'https://gateway-us-east.openclaw.io',
      status: 'online',
      version: '1.2.3',
      uptime: 720,
      connections: {
        active: 156,
        total: 500,
        websocket: 89,
        http: 67
      },
      resources: {
        memory: 45,
        cpu: 32,
        requestsPerMinute: 1250
      }
    },
    {
      id: 'gw-2',
      name: 'EU-West-1',
      region: 'eu-west-1',
      endpoint: 'https://gateway-eu-west.openclaw.io',
      status: 'online',
      version: '1.2.3',
      uptime: 480,
      connections: {
        active: 98,
        total: 400,
        websocket: 54,
        http: 44
      },
      resources: {
        memory: 38,
        cpu: 28,
        requestsPerMinute: 890
      }
    },
    {
      id: 'gw-3',
      name: 'AP-South-1',
      region: 'ap-south-1',
      endpoint: 'https://gateway-ap-south.openclaw.io',
      status: 'degraded',
      version: '1.2.2',
      uptime: 168,
      connections: {
        active: 23,
        total: 300,
        websocket: 12,
        http: 11
      },
      resources: {
        memory: 78,
        cpu: 65,
        requestsPerMinute: 320
      }
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/20 text-green-400';
      case 'degraded':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'offline':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-700 text-slate-400';
    }
  };

  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
  };

  return (
    <div className="p-8 space-y-6 bg-[var(--color-bg)] text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gateway Management</h1>
          <p className="text-slate-400 mt-1">Manage OpenClaw gateways across regions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Gateway</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-indigo-400" />
            <span className="text-slate-400 text-sm">Total Gateways</span>
          </div>
          <p className="text-3xl font-bold mt-2">{gateways.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-slate-400 text-sm">Online</span>
          </div>
          <p className="text-3xl font-bold mt-2">{gateways.filter(g => g.status === 'online').length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-slate-400 text-sm">Degraded</span>
          </div>
          <p className="text-3xl font-bold mt-2">{gateways.filter(g => g.status === 'degraded').length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-slate-400 text-sm">Total Requests/min</span>
          </div>
          <p className="text-3xl font-bold mt-2">
            {gateways.reduce((sum, g) => sum + g.resources.requestsPerMinute, 0)}
          </p>
        </div>
      </div>

      {/* Gateways Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gateways.map((gateway) => (
          <div
            key={gateway.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Server className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{gateway.name}</h3>
                  <p className="text-slate-400 text-sm">{gateway.region}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(gateway.status)}
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(gateway.status)}`}>
                  {gateway.status}
                </span>
                <button className="p-1 text-slate-400 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-slate-400 text-sm font-mono mb-4">{gateway.endpoint}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-slate-500 text-xs mb-1">Version</p>
                <p className="text-white font-medium">{gateway.version}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Uptime</p>
                <p className="text-white font-medium">{formatUptime(gateway.uptime)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Connections</p>
                <p className="text-white font-medium">{gateway.connections.active} / {gateway.connections.total}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Requests/min</p>
                <p className="text-white font-medium">{gateway.resources.requestsPerMinute.toLocaleString()}</p>
              </div>
            </div>

            {/* Resource Usage */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">CPU</span>
                  <span className="text-slate-300">{gateway.resources.cpu}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      gateway.resources.cpu > 80 ? 'bg-red-500' :
                      gateway.resources.cpu > 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${gateway.resources.cpu}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Memory</span>
                  <span className="text-slate-300">{gateway.resources.memory}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      gateway.resources.memory > 80 ? 'bg-red-500' :
                      gateway.resources.memory > 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${gateway.resources.memory}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {gateways.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🌐</div>
          <h3 className="text-white font-semibold mb-2">No Gateways</h3>
          <p className="text-slate-400">Add your first gateway</p>
        </div>
      )}
    </div>
  );
};

export default Gateways;
