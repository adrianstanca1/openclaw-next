import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// OpenClaw Next - Main Entry Point
// React application entry with provider setup
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./ui/App.js";
import "./ui/index.css";
class ErrorBoundary extends React.Component {
    state = { error: null };
    static getDerivedStateFromError(error) {
        return { error };
    }
    render() {
        if (this.state.error) {
            return (_jsxs("div", { style: {
                    padding: 32,
                    fontFamily: "monospace",
                    color: "#ef4444",
                    background: "#0f1115",
                    minHeight: "100vh",
                }, children: [_jsx("h1", { style: { fontSize: 24, marginBottom: 16 }, children: "App Error" }), _jsx("pre", { style: { whiteSpace: "pre-wrap", color: "#fca5a5" }, children: this.state.error.stack || this.state.error.message })] }));
        }
        return this.props.children;
    }
}
/**
 * Initialize and mount the React application
 */
const container = document.getElementById("root");
if (!container) {
    throw new Error("Root element not found");
}
const root = createRoot(container);
root.render(_jsx(React.StrictMode, { children: _jsx(ErrorBoundary, { children: _jsx(App, {}) }) }));
