import React from 'react';

interface EmptyStateProps {
  onCreate: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreate }) => (
  <div className="text-center py-16 card bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
    <div className="text-6xl mb-4">🤖</div>
    <h3 className="text-xl font-bold mb-2">No Agents Yet</h3>
    <p className="text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
      Create your first agent to start building AI-powered workflows
    </p>
    <button onClick={onCreate} className="btn-primary">
      <span className="mr-2">+</span>
      Create Your First Agent
    </button>
  </div>
);
