/**
 * OpenClaw Next - Trace Visualization Component
 * Renders hierarchical agent reasoning steps and execution timeline
 */

import React, { useState, useEffect } from 'react';
import type { ReasoningStep } from '../../agents/types.js';

interface TraceVisualizationProps {
  steps: ReasoningStep[];
  activeStepId?: string;
  onStepClick?: (step: ReasoningStep) => void;
}

export const TraceVisualization: React.FC<TraceVisualizationProps> = ({ 
  steps, 
  activeStepId, 
  onStepClick 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Reasoning Trace</h3>
        <div className="text-xs text-[var(--color-text-muted)]">
          {steps.length} steps recorded
        </div>
      </div>

      <div className="relative border-l-2 border-[var(--color-border)] ml-3 pl-6 space-y-6">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`relative group cursor-pointer transition-all ${activeStepId === step.id ? 'scale-[1.02]' : ''}`}
            onClick={() => onStepClick?.(step)}
          >
            {/* Timeline Dot */}
            <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-[var(--color-bg)] transition-colors ${
              activeStepId === step.id ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)] group-hover:bg-[var(--color-primary-muted)]'
            }`} />

            {/* Reasoning Block */}
            <div className={`card-hover p-4 rounded-xl border ${
              activeStepId === step.id ? 'border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/10 shadow-lg' : 'border-[var(--color-border)]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${getStepTypeColor(step.type)}`}>
                    <span>{getStepIcon(step.type)}</span>
                    {step.type}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {step.confidence !== undefined && (
                  <div className="text-xs font-medium" title="Confidence">
                    {Math.round(step.confidence * 100)}%
                  </div>
                )}
              </div>

              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {step.content}
              </div>

              {step.metadata?.keyInsights && step.metadata.keyInsights.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  <div className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1">Key Insights</div>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    {step.metadata.keyInsights.map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getStepIcon = (type: string): string => {
  switch (type) {
    case 'plan': return '📋';
    case 'analysis': return '🔍';
    case 'decision': return '⚖️';
    case 'execution': return '⚡';
    case 'observation': return '👁️';
    case 'reflection': return '🤔';
    case 'delegation': return '🤝';
    case 'learning': return '🧠';
    case 'synthesis': return '🧪';
    default: return '📍';
  }
};

const getStepTypeColor = (type: string): string => {
  switch (type) {
    case 'plan': return 'bg-blue-500/20 text-blue-500';
    case 'analysis': return 'bg-purple-500/20 text-purple-500';
    case 'decision': return 'bg-orange-500/20 text-orange-500';
    case 'execution': return 'bg-green-500/20 text-green-500';
    case 'observation': return 'bg-teal-500/20 text-teal-500';
    case 'reflection': return 'bg-indigo-500/20 text-indigo-500';
    case 'delegation': return 'bg-pink-500/20 text-pink-500';
    default: return 'bg-gray-500/20 text-gray-500';
  }
};
