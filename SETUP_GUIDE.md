# OpenClaw Next - 1-Click Configuration System

## Overview

The 1-click configuration system provides an automated setup experience for the OpenClaw Next dashboard, guiding users through configuration with intelligent validation and Ollama integration.

## Components

### 1. Setup Wizard (`src/ui/components/SetupWizard.tsx`)

A 6-step wizard that guides users through configuration:

**Step 1: Welcome**
- Introduction to OpenClaw
- Overview of features

**Step 2: Ollama Configuration**
- Test local Ollama connection (default: http://localhost:11434)
- Optional: Configure Ollama Cloud
- Model selection (llama3.2, llama3.1, etc.)

**Step 3: API Keys**
- OpenAI (optional)
- Anthropic (optional)
- Groq (optional)
- Gemini (optional)

**Step 4: Gateway Setup**
- WebSocket URL configuration
- Authentication toggle
- Token generation

**Step 5: Validation**
- Test all connections
- Verify configurations
- Show status summary

**Step 6: Complete**
- Save configuration
- Launch dashboard

### 2. Configuration Manager (`src/core/config.ts`)

**Features:**
- Secure credential handling
- Automatic sensitive field masking
- Environment variable loading (VITE_* prefix)
- localStorage persistence (non-sensitive data only)
- Validation and error reporting
- Import/export functionality

**Security:**
- API keys masked in UI
- Sensitive fields excluded from storage
- Type-safe configuration

### 3. Ollama Client (`src/core/ollama.ts`)

**Features:**
- Local Ollama support (port 11434)
- Ollama Cloud support (api.ollama.com)
- Connection health checking
- Model listing and management
- Streaming responses
- Embeddings generation

**Smart Features:**
- Automatic endpoint detection
- Model capability detection
- Recommended model selection

### 4. Smart API Server (`src/core/api-server.ts`)

**Features:**
- REST API with TypeScript types
- Agent delegation system
- Subagent management (worker, specialist, coordinator, validator)
- Task queue with priority levels
- Real-time updates via WebSocket

**Endpoints:**
- `/health` - Server health
- `/config` - Configuration management
- `/ollama/status` - Ollama connection
- `/ollama/models` - Available models
- `/delegate` - Task delegation
- `/tasks` - Task queue
- `/subagents` - Subagent management

## Quick Start Guide

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd openclaw-next

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

### Configuration (.env)

```bash
# Required: Ollama Local
VITE_OLLAMA_ENDPOINT=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2

# Optional: Ollama Cloud
VITE_OLLAMA_CLOUD_ENABLED=true
VITE_OLLAMA_CLOUD_API_KEY=your-key

# Optional: Other Providers
VITE_OPENAI_API_KEY=your-key
VITE_ANTHROPIC_API_KEY=your-key
VITE_GROQ_API_KEY=your-key

# Gateway
VITE_GATEWAY_URL=ws://localhost:18789
```

### Running

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview
```

## First Run Experience

1. **Dashboard loads** → Checks configuration
2. **Setup Wizard appears** → Guides through 6 steps
3. **Ollama connection** → Tests local/cloud connection
4. **API keys** → Optional provider setup
5. **Validation** → Verifies all connections
6. **Complete** → Saves and launches dashboard

## Architecture

```
User → Setup Wizard → Config Manager → localStorage
                         ↓
                   Ollama Client → Ollama API
                         ↓
                   API Server → Dashboard
```

## Features

### Intelligent Validation
- Real-time connection testing
- Automatic error detection
- Helpful error messages

### Flexible Configuration
- Environment variables
- localStorage persistence
- Runtime updates

### Security
- Masked credentials
- No sensitive data in localStorage
- Secure defaults

## Troubleshooting

### Ollama Connection Failed
1. Verify Ollama is running: `ollama --version`
2. Check endpoint URL
3. Test: `curl http://localhost:11434/api/tags`

### Gateway Connection Failed
1. Check WebSocket URL
2. Verify firewall settings
3. Check authentication token

### Configuration Not Saving
1. Check browser localStorage
2. Verify no ad blockers interfering
3. Check browser console for errors

## API Reference

### ConfigManager

```typescript
import { configManager } from './core/config.js';

// Load configuration
await configManager.load();

// Get configuration
const config = configManager.get();

// Update configuration
configManager.update({ ollama: { enabled: true } });

// Save configuration
await configManager.save();

// Validate configuration
const { valid, errors } = configManager.validate();
```

### OllamaClient

```typescript
import { ollamaClient } from './core/ollama.js';

// Check connection
const status = await ollamaClient.checkConnection();

// List models
const models = await ollamaClient.listModels();

// Generate text
const response = await ollamaClient.generate({
  model: 'llama3.2',
  prompt: 'Hello'
});

// Stream response
for await (const chunk of ollamaClient.generateStream({
  model: 'llama3.2',
  prompt: 'Hello'
})) {
  console.log(chunk.response);
}
```

### SmartApiServer

```typescript
import { smartApiServer } from './core/api-server.js';

// Start server
await smartApiServer.start();

// Delegate task
const result = await smartApiServer.delegateTask({
  taskId: 'task-1',
  task: 'Analyze this code',
  complexity: 'medium',
  requiredCapabilities: ['code_analysis']
});

// Get subagent status
const subagents = await smartApiServer.getSubagentStatus();
```

## Customization

### Adding New Configuration Options

1. Update `AppConfig` interface in `src/core/config.ts`
2. Add default value to `DEFAULT_CONFIG`
3. Update environment variable loader
4. Add to Setup Wizard UI

### Adding New Setup Steps

1. Add step definition to `WizardStep` type
2. Create step component in SetupWizard
3. Add validation logic
4. Update step navigation

## License

MIT License - See LICENSE file for details
