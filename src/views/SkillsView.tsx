/**
 * OpenClaw Next - Skills View
 * React version of Skills management view
 */

import React, { useState, useEffect } from 'react';
import { skillRegistry } from '../agents/skills.js';
import type { SkillSchema } from '../agents/types.js';

// Extend JSX namespace for custom element
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'skill-creator-panel': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export const SkillsView: React.FC = () => {
  const [skills, setSkills] = useState<SkillSchema[]>([]);
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    setSkills(skillRegistry.list());
  }, []);

  const handleCreateNew = () => {
    setShowCreator(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Skills</h1>
          <p className="text-[var(--color-text-muted)]">Manage and create agent capabilities</p>
        </div>
        <button 
          className="btn-primary"
          onClick={handleCreateNew}
        >
          + Create New Skill
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map(skill => (
          <div key={skill.id} className="card-hover">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                ✨
              </div>
              <div>
                <h3 className="font-semibold">{skill.name}</h3>
                <div className="text-xs font-mono text-[var(--color-text-muted)]">{skill.id}</div>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">
              {skill.description}
            </p>
            <div className="flex gap-4 text-xs text-[var(--color-text-muted)]">
              <span>🧰 {skill.methods.length} methods</span>
              <span>📦 {skill.requires.length} deps</span>
              <span>🔐 {skill.permissions.length} perms</span>
            </div>
          </div>
        ))}
      </div>

      {showCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[var(--color-surface)] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto border border-[var(--color-border)]">
            <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
              <h2 className="text-xl font-bold">Create New Skill</h2>
              <button 
                onClick={() => setShowCreator(false)}
                className="text-2xl hover:text-[var(--color-primary)]"
              >×</button>
            </div>
            <div className="p-6">
               {/* SkillCreatorPanel is a web component, so we can use it here */}
               <skill-creator-panel></skill-creator-panel>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsView;
