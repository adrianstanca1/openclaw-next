import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * OpenClaw Next - AI-Driven Setup Wizard
 * Replaces static forms with a strategic, AI-led onboarding experience.
 */
import { useState } from 'react';
import { onboardingAssistant } from '../../core/onboarding-assistant.js';
export const SetupWizard = ({ onComplete }) => {
    const [phase, setPhase] = useState('discovery');
    const [userGoal, setUserGoal] = useState('');
    const [scheme, setSetupScheme] = useState(null);
    const [keys, setKeys] = useState({});
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
        }
        else {
            setPhase('credentials');
            setAiMessage(`To complete this setup, I just need a few specific access keys. I'll explain each one.`);
        }
    };
    return (_jsxs("div", { className: "min-h-screen flex bg-slate-950 text-slate-200 font-sans", children: [_jsxs("aside", { className: "w-96 bg-slate-900 border-r border-white/5 p-10 flex flex-col shadow-2xl", children: [_jsxs("div", { className: "flex items-center gap-4 mb-12", children: [_jsx("div", { className: "w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20", children: "\uD83E\uDDE0" }), _jsxs("div", { children: [_jsx("h2", { className: "font-black text-xl tracking-tight text-white", children: "OPENCLAW" }), _jsx("div", { className: "text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em]", children: "Strategy Engine" })] })] }), _jsxs("div", { className: "flex-1 space-y-8", children: [_jsx("div", { className: "relative", children: _jsxs("div", { className: "bg-slate-800/50 border border-white/10 rounded-3xl p-6 text-sm leading-relaxed text-slate-300 italic shadow-inner", children: ["\"", aiMessage, "\""] }) }), phase === 'proposal' && scheme && (_jsxs("div", { className: "space-y-4 animate-fadeIn", children: [_jsx("h4", { className: "text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]", children: "Selected Architecture" }), _jsx("div", { className: "p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20", children: _jsx("p", { className: "text-xs text-indigo-300", children: scheme.recommendedArchitecture }) })] }))] }), _jsx("div", { className: "pt-8 border-t border-white/5 text-[9px] text-white/20 font-mono text-center", children: "SYSTEM_VERSION: 1.0.0-ALPHA_NEURAL" })] }), _jsx("main", { className: "flex-1 flex flex-col p-20 justify-center", children: _jsxs("div", { className: "max-w-xl w-full mx-auto", children: [phase === 'discovery' && (_jsxs("div", { className: "space-y-8 animate-slideUp", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-black text-white mb-4", children: "Define Your Mission" }), _jsx("p", { className: "text-slate-400", children: "Describe what you want to achieve in plain English. I'll handle the technical mapping." })] }), _jsx("textarea", { className: "w-full bg-slate-900 border border-white/10 rounded-3xl p-6 text-lg focus:border-indigo-500 transition-all outline-none min-h-[150px] shadow-2xl", placeholder: "e.g. I want an assistant that watches my GitHub repos and sends me summaries on Telegram.", value: userGoal, onChange: (e) => setUserGoal(e.target.value) }), _jsx("button", { onClick: handleAnalyze, disabled: !userGoal, className: "btn-primary w-full py-5 rounded-3xl font-bold text-lg shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all", children: "Generate Setup Plan \u2192" })] })), phase === 'proposal' && scheme && (_jsxs("div", { className: "space-y-10 animate-fadeIn", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("h1", { className: "text-4xl font-black text-white", children: ["The \"", scheme.mission, "\" Plan"] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-6 rounded-3xl bg-slate-900 border border-white/5", children: [_jsx("div", { className: "text-2xl mb-2", children: "\uD83E\uDD16" }), _jsx("div", { className: "text-xs font-bold text-slate-500 uppercase mb-1", children: "Local Models" }), _jsx("div", { className: "text-sm font-medium", children: scheme.suggestedLocalModels.join(', ') })] }), _jsxs("div", { className: "p-6 rounded-3xl bg-slate-900 border border-white/5", children: [_jsx("div", { className: "text-2xl mb-2", children: "\u26A1" }), _jsx("div", { className: "text-xs font-bold text-slate-500 uppercase mb-1", children: "Abilities" }), _jsx("div", { className: "text-sm font-medium", children: scheme.capabilitiesToEnable.join(', ') })] })] })] }), _jsx("button", { onClick: startKeyCollection, className: "btn-primary w-full py-5 rounded-3xl font-bold text-lg", children: "Accept and Configure \u2192" })] })), phase === 'credentials' && scheme && (_jsxs("div", { className: "space-y-8 animate-fadeIn", children: [_jsx("h1", { className: "text-4xl font-black text-white", children: "Required Access" }), _jsx("div", { className: "space-y-6", children: scheme.requiredKeys.map(key => (_jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-bold text-slate-400 uppercase tracking-widest", children: [key, " API Key"] }), _jsx("input", { type: "password", className: "w-full bg-slate-900 border border-white/10 rounded-2xl p-4 focus:border-indigo-500 outline-none", placeholder: `Paste your ${key} key here`, value: keys[key] || '', onChange: (e) => setKeys({ ...keys, [key]: e.target.value }) })] }, key))) }), _jsx("button", { onClick: () => setPhase('finalizing'), className: "btn-primary w-full py-5 rounded-3xl font-bold text-lg", children: "Finalize Optimization \u2192" })] })), phase === 'finalizing' && (_jsxs("div", { className: "text-center space-y-8 animate-fadeIn", children: [_jsx("div", { className: "text-8xl animate-bounce", children: "\uD83D\uDE80" }), _jsx("h1", { className: "text-4xl font-black text-white", children: "Optimizing Neural Core" }), _jsx("p", { className: "text-slate-400", children: "Applying your settings, priming local models, and initializing memory layers..." }), _jsx("div", { className: "w-full bg-slate-900 h-2 rounded-full overflow-hidden", children: _jsx("div", { className: "bg-indigo-500 h-full animate-progressWidth" }) }), _jsx("button", { onClick: onComplete, className: "btn-primary px-12 py-4 rounded-3xl font-bold", children: "Awaken Assistant" })] }))] }) })] }));
};
export default SetupWizard;
