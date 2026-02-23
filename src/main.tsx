// OpenClaw Next - Main Entry Point
// React application entry with provider setup

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App.js';
import './ui/index.css';

/**
 * Initialize and mount the React application
 */
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
