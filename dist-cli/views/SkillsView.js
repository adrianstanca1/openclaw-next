import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * OpenClaw Next - Skills View
 * React version of Skills management view
 */
import { useState, useEffect } from 'react';
import { skillRegistry } from '../agents/skills.js';
export const SkillsView = () => {
    const [skills, setSkills] = useState([]);
    const [showCreator, setShowCreator] = useState(false);
    useEffect(() => {
        setSkills(skillRegistry.list());
    }, []);
    const handleCreateNew = () => {
        setShowCreator(true);
    };
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Skills" }), _jsx("p", { className: "text-[var(--color-text-muted)]", children: "Manage and create agent capabilities" })] }), _jsx("button", { className: "btn-primary", onClick: handleCreateNew, children: "+ Create New Skill" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: skills.map(skill => (_jsxs("div", { className: "card-hover", children: [_jsxs("div", { className: "flex items-start gap-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white", children: "\u2728" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: skill.name }), _jsx("div", { className: "text-xs font-mono text-[var(--color-text-muted)]", children: skill.id })] })] }), _jsx("p", { className: "text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2", children: skill.description }), _jsxs("div", { className: "flex gap-4 text-xs text-[var(--color-text-muted)]", children: [_jsxs("span", { children: ["\uD83E\uDDF0 ", skill.methods.length, " methods"] }), _jsxs("span", { children: ["\uD83D\uDCE6 ", skill.requires.length, " deps"] }), _jsxs("span", { children: ["\uD83D\uDD10 ", skill.permissions.length, " perms"] })] })] }, skill.id))) }), showCreator && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50", children: _jsxs("div", { className: "bg-[var(--color-surface)] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto border border-[var(--color-border)]", children: [_jsxs("div", { className: "p-4 border-b border-[var(--color-border)] flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-bold", children: "Create New Skill" }), _jsx("button", { onClick: () => setShowCreator(false), className: "text-2xl hover:text-[var(--color-primary)]", children: "\u00D7" })] }), _jsx("div", { className: "p-6", children: _jsx("skill-creator-panel", {}) })] }) }))] }));
};
export default SkillsView;
