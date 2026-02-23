import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * OpenClaw Next - Presets View
 * One-click agent transformation UI
 */
import { useState } from 'react';
import { BUILTIN_PRESETS, presetManager } from '../../presets/manager.js';
export const PresetsView = () => {
    const [loading, setLoading] = useState(null);
    const [message, setMessage] = useState(null);
    const handleApply = async (id) => {
        setLoading(id);
        setMessage(null);
        try {
            presetManager.applyPreset(id);
            setMessage({ type: 'success', text: `Successfully transformed into ${id}!` });
        }
        catch (e) {
            setMessage({ type: 'error', text: `Failed to apply preset: ${id}` });
        }
        finally {
            setLoading(null);
        }
    };
    return (_jsxs("div", { className: "p-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: "Personality Store" }), _jsx("p", { className: "text-[var(--color-text-muted)]", children: "Transform your assistant's core directives and tools with one click." })] }), message && (_jsx("div", { className: `p-4 mb-6 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`, children: message.text })), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: BUILTIN_PRESETS.map((preset) => (_jsxs("div", { className: "card-hover flex flex-col h-full", children: [_jsxs("div", { className: "text-4xl mb-4", children: [preset.id === 'devops-architect' && '🏗️', preset.id === 'creative-writer' && '✍️', preset.id === 'research-analyst' && '🔍'] }), _jsx("h3", { className: "text-xl font-bold mb-2", children: preset.name }), _jsx("p", { className: "text-sm text-[var(--color-text-muted)] mb-6 flex-1", children: preset.description }), _jsx("div", { className: "space-y-3 mb-6", children: _jsx("div", { className: "flex flex-wrap gap-2", children: preset.tools.map(t => (_jsx("span", { className: "text-[10px] px-2 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)]", children: t }, t))) }) }), _jsx("button", { onClick: () => handleApply(preset.id), disabled: !!loading, className: `w-full py-2 rounded-lg font-bold transition-all ${loading === preset.id
                                ? 'bg-[var(--color-border)] cursor-not-allowed'
                                : 'bg-[var(--color-primary)] text-white hover:opacity-90'}`, children: loading === preset.id ? 'Applying...' : 'Activate Cartridge' })] }, preset.id))) })] }));
};
