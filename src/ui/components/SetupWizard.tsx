/**
 * OpenClaw Next - AI-Driven Setup Wizard
 * Replaces static forms with a strategic, AI-led onboarding experience.
 */

import React, { useState, useEffect } from 'react';
import { onboardingAssistant, type SetupScheme } from '../../core/onboarding-assistant.js';

export const SetupWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'discovery' | 'proposal' | 'credentials' | 'finalizing'>('discovery');
  const [userGoal, setUserGoal] = useState('');
  const [scheme, setSetupScheme] = useState<SetupScheme | null>(null);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [aiMessage, setAiMessage] = useState("Hello! Before we build your system, tell me: What is your primary mission for this assistant?");

  /**
   * Handle the Strategic Discovery
   */
  const handleAnalyze = async () => {
    setAiMessage("Analyzing your requirements... designing architecture...");
    const proposed = await onboardingAssistant.proposeScheme(userGoal);
    setSetupScheme(proposed);
    setAiMessage(`I've designed a plan for your "${proposed.mission}" mission. Review it on the right!`);
    setPhase('proposal');
  };

  /**
   * Start collecting specific credentials based on the AI plan
   */
  const startKeyCollection = () => {
    if (scheme?.requiredKeys.length === 0) {
      setPhase('finalizing');
    } else {
      setPhase('credentials');
      setAiMessage(`To complete this setup, I just need a few specific access keys. I'll explain each one.`);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 font-sans">
      {/* AI STRATEGIST SIDEBAR */}
      <aside className="w-96 bg-slate-900 border-r border-white/5 p-10 flex flex-col shadow-2xl">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20">🧠</div>
          <div>
            <h2 className="font-black text-xl tracking-tight text-white">OPENCLAW</h2>
            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em]">Strategy Engine</div>
          </div>
        </div>

        <div className="flex-1 space-y-8">
          <div className="relative">
            <div className="bg-slate-800/50 border border-white/10 rounded-3xl p-6 text-sm leading-relaxed text-slate-300 italic shadow-inner">
              "{aiMessage}"
            </div>
          </div>

          {phase === 'proposal' && scheme && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Selected Architecture</h4>
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-xs text-indigo-300">{scheme.recommendedArchitecture}</p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-white/5 text-[9px] text-white/20 font-mono text-center">
          SYSTEM_VERSION: 1.0.0-ALPHA_NEURAL
        </div>
      </aside>

      {/* INTERACTIVE WORK AREA */}
      <main className="flex-1 flex flex-col p-20 justify-center">
        <div className="max-w-xl w-full mx-auto">
          
          {phase === 'discovery' && (
            <div className="space-y-8 animate-slideUp">
              <div>
                <h1 className="text-4xl font-black text-white mb-4">Define Your Mission</h1>
                <p className="text-slate-400">Describe what you want to achieve in plain English. I'll handle the technical mapping.</p>
              </div>
              <textarea 
                className="w-full bg-slate-900 border border-white/10 rounded-3xl p-6 text-lg focus:border-indigo-500 transition-all outline-none min-h-[150px] shadow-2xl"
                placeholder="e.g. I want an assistant that watches my GitHub repos and sends me summaries on Telegram."
                value={userGoal}
                onChange={(e) => setUserGoal(e.target.value)}
              />
              <button 
                onClick={handleAnalyze}
                disabled={!userGoal}
                className="btn-primary w-full py-5 rounded-3xl font-bold text-lg shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Generate Setup Plan →
              </button>
            </div>
          )}

          {phase === 'proposal' && scheme && (
            <div className="space-y-10 animate-fadeIn">
              <div className="space-y-4">
                <h1 className="text-4xl font-black text-white">The "{scheme.mission}" Plan</h1>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-3xl bg-slate-900 border border-white/5">
                    <div className="text-2xl mb-2">🤖</div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Local Models</div>
                    <div className="text-sm font-medium">{scheme.suggestedLocalModels.join(', ')}</div>
                  </div>
                  <div className="p-6 rounded-3xl bg-slate-900 border border-white/5">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Abilities</div>
                    <div className="text-sm font-medium">{scheme.capabilitiesToEnable.join(', ')}</div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={startKeyCollection}
                className="btn-primary w-full py-5 rounded-3xl font-bold text-lg"
              >
                Accept and Configure →
              </button>
            </div>
          )}

          {phase === 'credentials' && scheme && (
            <div className="space-y-8 animate-fadeIn">
              <h1 className="text-4xl font-black text-white">Required Access</h1>
              <div className="space-y-6">
                {scheme.requiredKeys.map(key => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">{key} API Key</label>
                    <input 
                      type="password"
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 focus:border-indigo-500 outline-none"
                      placeholder={`Paste your ${key} key here`}
                      value={keys[key] || ''}
                      onChange={(e) => setKeys({...keys, [key]: e.target.value})}
                    />
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setPhase('finalizing')}
                className="btn-primary w-full py-5 rounded-3xl font-bold text-lg"
              >
                Finalize Optimization →
              </button>
            </div>
          )}

          {phase === 'finalizing' && (
            <div className="text-center space-y-8 animate-fadeIn">
              <div className="text-8xl animate-bounce">🚀</div>
              <h1 className="text-4xl font-black text-white">Optimizing Neural Core</h1>
              <p className="text-slate-400">Applying your settings, priming local models, and initializing memory layers...</p>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full animate-progressWidth"></div>
              </div>
              <button 
                onClick={onComplete}
                className="btn-primary px-12 py-4 rounded-3xl font-bold"
              >
                Awaken Assistant
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default SetupWizard;
