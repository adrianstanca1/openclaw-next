import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <div className="card bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
        <p className={`text-2xl font-bold ${color || ''}`}>{value}</p>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);
