import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// OpenClaw Next - API Keys Management Page
// Manage API access keys
import { Plus, Trash2, Copy, Check } from "lucide-react";
import { useState } from "react";
export const ApiKeys = () => {
    const [copiedId, setCopiedId] = useState(null);
    // Mock API keys data - will be replaced with API data
    const apiKeys = [
        {
            id: "key-1",
            name: "Production Key",
            key: "oc_key_prod_xxxxxxxxxxxxxxxxxxxxxxxx",
            permissions: ["read", "write", "admin"],
            lastUsed: new Date(Date.now() - 120000).toISOString(),
            createdAt: new Date(Date.now() - 2592000000).toISOString(),
        },
        {
            id: "key-2",
            name: "Staging Key",
            key: "oc_key_staging_xxxxxxxxxxxxxxxxxxxx",
            permissions: ["read", "write"],
            lastUsed: new Date(Date.now() - 3600000).toISOString(),
            createdAt: new Date(Date.now() - 1728000000).toISOString(),
        },
        {
            id: "key-3",
            name: "Development",
            key: "oc_key_dev_xxxxxxxxxxxxxxxxxxxxxxx",
            permissions: ["read"],
            lastUsed: new Date(Date.now() - 259200000).toISOString(),
            createdAt: new Date(Date.now() - 864000000).toISOString(),
        },
    ];
    const handleCopy = async (key, id) => {
        await navigator.clipboard.writeText(key);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    const formatLastUsed = (dateString) => {
        if (!dateString)
            return "Never";
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1)
            return "Just now";
        if (minutes < 60)
            return `${minutes}m ago`;
        if (hours < 24)
            return `${hours}h ago`;
        return `${days}d ago`;
    };
    return (_jsxs("div", { className: "p-8 space-y-6 bg-[var(--color-bg)] text-white", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "API Keys" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Manage API access keys" })] }), _jsxs("button", { className: "flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Create Key" })] })] }), _jsx("div", { className: "space-y-4", children: apiKeys.map((apiKey) => (_jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-white font-semibold", children: apiKey.name }), _jsx("div", { className: "flex gap-1", children: apiKey.permissions.map((perm) => (_jsx("span", { className: "px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded", children: perm }, perm))) })] }), _jsxs("div", { className: "flex items-center gap-3 mt-3", children: [_jsxs("code", { className: "text-slate-400 text-sm font-mono bg-slate-800 px-3 py-1.5 rounded", children: [apiKey.key.substring(0, 12), "...", apiKey.key.substring(apiKey.key.length - 4)] }), _jsx("button", { onClick: () => handleCopy(apiKey.key, apiKey.id), className: "p-1.5 text-slate-400 hover:text-white transition-colors", title: "Copy full key", children: copiedId === apiKey.id ? (_jsx(Check, { className: "w-4 h-4 text-green-400" })) : (_jsx(Copy, { className: "w-4 h-4" })) })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-slate-400 text-sm", children: ["Last used:", " ", _jsx("span", { className: "text-slate-300", children: formatLastUsed(apiKey.lastUsed) })] }), apiKey.expiresAt && (_jsxs("p", { className: "text-slate-500 text-xs mt-1", children: ["Expires: ", new Date(apiKey.expiresAt).toLocaleDateString()] }))] }), _jsx("button", { className: "ml-4 p-2 text-slate-400 hover:text-red-400 transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) }, apiKey.id))) }), apiKeys.length === 0 && (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-12 text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDD11" }), _jsx("h3", { className: "text-white font-semibold mb-2", children: "No API Keys" }), _jsx("p", { className: "text-slate-400", children: "Create your first API key" })] }))] }));
};
export default ApiKeys;
