import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const TraceVisualization = ({ steps, activeStepId, onStepClick }) => {
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Reasoning Trace" }), _jsxs("div", { className: "text-xs text-[var(--color-text-muted)]", children: [steps.length, " steps recorded"] })] }), _jsx("div", { className: "relative border-l-2 border-[var(--color-border)] ml-3 pl-6 space-y-6", children: steps.map((step, index) => (_jsxs("div", { className: `relative group cursor-pointer transition-all ${activeStepId === step.id ? 'scale-[1.02]' : ''}`, onClick: () => onStepClick?.(step), children: [_jsx("div", { className: `absolute -left-[31px] w-4 h-4 rounded-full border-2 border-[var(--color-bg)] transition-colors ${activeStepId === step.id ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)] group-hover:bg-[var(--color-primary-muted)]'}` }), _jsxs("div", { className: `card-hover p-4 rounded-xl border ${activeStepId === step.id ? 'border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/10 shadow-lg' : 'border-[var(--color-border)]'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: `text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${getStepTypeColor(step.type)}`, children: [_jsx("span", { children: getStepIcon(step.type) }), step.type] }), _jsx("span", { className: "text-xs text-[var(--color-text-muted)]", children: new Date(step.timestamp).toLocaleTimeString() })] }), step.confidence !== undefined && (_jsxs("div", { className: "text-xs font-medium", title: "Confidence", children: [Math.round(step.confidence * 100), "%"] }))] }), _jsx("div", { className: "text-sm leading-relaxed whitespace-pre-wrap", children: step.content }), step.metadata?.keyInsights && step.metadata.keyInsights.length > 0 && (_jsxs("div", { className: "mt-3 pt-3 border-t border-[var(--color-border)]", children: [_jsx("div", { className: "text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1", children: "Key Insights" }), _jsx("ul", { className: "text-xs list-disc list-inside space-y-1", children: step.metadata.keyInsights.map((insight, i) => (_jsx("li", { children: insight }, i))) })] }))] })] }, step.id))) })] }));
};
const getStepIcon = (type) => {
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
const getStepTypeColor = (type) => {
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
