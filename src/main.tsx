// OpenClaw Next - Main Entry Point
// React application entry with provider setup

import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./ui/App.js";
import "./ui/index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 32,
            fontFamily: "monospace",
            color: "#ef4444",
            background: "#0f1115",
            minHeight: "100vh",
          }}
        >
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>App Error</h1>
          <pre style={{ whiteSpace: "pre-wrap", color: "#fca5a5" }}>
            {(this.state.error as Error).stack || (this.state.error as Error).message}
          </pre>
        </div>
      );
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

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
