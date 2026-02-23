# OpenClaw Next

**Superintelligence Agentic Gateway System**

Next-generation AI agent orchestration platform with intelligent skill creation, multi-agent delegation, and seamless Ollama integration.

## Features

### Core Capabilities
- **Agent Management** - Spawn, monitor, and coordinate autonomous agents
- **Skill System** - Create, register, and invoke reusable skills
- **Tool Orchestration** - Manage tools with rate limiting and approvals
- **Memory System** - Short-term, long-term, and working memory for agents
- **Multi-Agent Collaboration** - Delegate tasks between agents
- **Smart API Server** - REST and WebSocket APIs for integration

### AI-Powered Skill Creator
- **Request Analysis** - AI evaluates and enhances skill requests
- **Auto-Generation** - Creates complete skill schemas automatically
- **Documentation** - Generates skill.md files with examples
- **Dependency Detection** - Automatically identifies required dependencies

### Dashboard & UI
- **Setup Wizard** - 1-click configuration for Ollama/API keys
- **Real-time Monitoring** - Agent health, memory stats, tool usage
- **Visual Skill Editor** - Create skills with AI assistance
- **Plugin Marketplace** - Discover and install plugins

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/openclaw-next.git
cd openclaw-next

# Install dependencies
npm install

# Configure Ollama (optional - uses cloud API by default)
npm run config set ollama.apiUrl http://localhost:11434
npm run config set ollama.defaultModel llama2

# Start the dashboard
npm run dev
```

### CLI Usage

```bash
# Start the agent system
npm run start

# Spawn a new agent
npm run agent spawn "Code Reviewer" developer

# Create a skill with AI
npm run skill create "Analyze code for security vulnerabilities"

# List all agents
npm run agent list

# Check system status
npm run cli status

# Start API server
npm run serve
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

#### Required Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_OLLAMA_ENDPOINT` | Local Ollama URL | `http://localhost:11434` |
| `VITE_GATEWAY_URL` | WebSocket gateway URL | `ws://localhost:18789` |

#### Optional API Keys

| Provider | Variable | Description |
|----------|----------|-------------|
| Ollama Cloud | `VITE_OLLAMA_CLOUD_API_KEY` | For cloud Ollama access |
| OpenAI | `VITE_OPENAI_API_KEY` | For GPT models |
| Anthropic | `VITE_ANTHROPIC_API_KEY` | For Claude models |
| Groq | `VITE_GROQ_API_KEY` | For fast inference |
| Gemini | `VITE_GEMINI_API_KEY` | For Google models |

### Ollama Setup

#### Local Ollama

1. Install Ollama from [ollama.com](https://ollama.com)
2. Start Ollama: `ollama serve`
3. Pull models:
   ```bash
   ollama pull llama3.2
   ollama pull llama3.1
   ollama pull nomic-embed-text
   ```

#### Ollama Cloud

1. Get your API key from [ollama.com](https://ollama.com)
2. Set `VITE_OLLAMA_CLOUD_ENABLED=true`
3. Set `VITE_OLLAMA_CLOUD_API_KEY=your-key`

## Architecture

### Core Components

```
openclaw-next/
├── src/
│   ├── core/              # Core infrastructure
│   │   ├── config.ts      # Configuration management
│   │   ├── ollama.ts      # Ollama client (local/cloud)
│   │   ├── api-server.ts  # Smart API server with delegation
│   │   └── types.ts       # Core type definitions
│   ├── agents/            # Agent management
│   │   ├── manager.ts     # Agent lifecycle management
│   │   ├── executor.ts    # Agent execution engine
│   │   └── types.ts       # Agent-specific types
│   ├── plugins/           # Plugin system
│   │   ├── manager.ts     # Plugin lifecycle
│   │   ├── hook-system.ts # Hook registration and execution
│   │   └── types.ts       # Plugin types
│   ├── skills/            # Skills management
│   │   ├── manager.ts     # Skill registry
│   │   └── marketplace.ts # Skill marketplace
│   ├── tools/             # Tool registry
│   │   ├── registry.ts    # Tool definitions
│   │   └── executor.ts    # Tool execution
│   ├── ui/                # React UI components
│   │   ├── components/    # Reusable components
│   │   │   ├── SetupWizard.tsx      # 1-click setup
│   │   │   └── DashboardLayout.tsx  # Main layout
│   │   ├── App.tsx        # Main app component
│   │   └── types.ts       # UI types
│   └── views/             # Dashboard views
│       ├── AgentDashboard.tsx       # Agent management
│       └── DelegationDashboard.tsx  # Subagent delegation
└── package.json
```

### Smart API Server

The `SmartApiServer` provides:

- **REST API endpoints** for agents, tools, plugins, skills
- **WebSocket** real-time communication
- **Agent delegation** with intelligent task routing
- **Subagent management** with role-based capabilities
- **Task queue** with priority levels
- **Health monitoring** and metrics

### Agent Delegation

Agents can delegate tasks to specialized subagents:

- **Worker**: Execute tasks, use tools
- **Specialist**: Complex reasoning and analysis
- **Coordinator**: Manage multiple subagents
- **Validator**: Review and validate outputs

## Features

### 1-Click Setup Wizard

The setup wizard guides you through:

1. **Welcome**: Introduction to OpenClaw
2. **Ollama Configuration**: Test local/cloud connection
3. **API Keys**: Optional provider setup
4. **Gateway Setup**: Configure WebSocket gateway
5. **Validation**: Verify all connections
6. **Complete**: Start using OpenClaw

### Agent Management

- Create, configure, and manage agents
- Monitor agent health and status
- View session history
- Pause/resume agents
- Role-based access control

### Delegation Dashboard

- View agent hierarchy
- Create subagents with specific roles
- Monitor active delegations
- Track task progress
- Terminate tasks when needed

### Plugin System

- Install and manage plugins
- Hook-based extensibility
- Priority-based hook execution
- Hot-reload support

### Skills Marketplace

- Browse available skills
- Install with one click
- Skill versioning
- Dependency management

## API Endpoints

### Health & Config

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health status |
| `/config` | GET/POST | Configuration management |

### Ollama

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ollama/status` | GET | Connection status |
| `/ollama/models` | GET | Available models |

### Delegation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/delegate` | POST | Delegate task to agent |
| `/tasks` | GET | List task queue |
| `/subagents` | GET | List subagents |

## Development

### Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Project Structure

- **Core**: Configuration, Ollama client, API server
- **Agents**: Agent lifecycle, execution, delegation
- **Plugins**: Plugin management, hook system
- **Skills**: Skill registry, marketplace
- **Tools**: Tool definitions, execution
- **UI**: React components, views

### Adding New Features

1. **New Agent Type**: Add to `src/agents/types.ts` and implement in `src/agents/manager.ts`
2. **New Tool**: Define in `src/tools/types.ts`, register in `src/tools/registry.ts`
3. **New Plugin**: Implement `Plugin` interface from `src/plugins/types.ts`
4. **New View**: Create in `src/views/` and add route in `src/ui/App.tsx`

## Smart Task Delegation

The system uses intelligent delegation to distribute tasks:

```typescript
// Example: Delegate a task
const result = await smartApiServer.delegateTask({
  taskId: 'task-123',
  task: 'Analyze this code',
  context: { code: '...' },
  complexity: 'medium',
  requiredCapabilities: ['code_analysis'],
  priority: 'normal',
});

// Result includes:
// - assignedAgent: ID of subagent handling the task
// - success: Whether delegation succeeded
// - reasoning: Why this agent was selected
```

### Delegation Strategy

1. **Analyze task** complexity and requirements
2. **Select best agent** based on capabilities and load
3. **Queue task** with appropriate priority
4. **Monitor execution** and collect results
5. **Handle failures** with retry and fallback

## Recommended Models

### For General Use

- **llama3.2**: Fast, efficient, good for most tasks
- **llama3.1**: Larger context (128k), better reasoning

### For Coding

- **codellama**: Specialized for code generation
- **qwen2.5**: Excellent coding and reasoning

### For Embeddings

- **nomic-embed-text**: Best for RAG applications

### For Vision

- **llava**: Multimodal, can process images

## Security

- API keys are masked in UI
- Sensitive fields encrypted in storage
- Request authentication on protected endpoints
- CORS configuration for safe cross-origin requests

## Troubleshooting

### Ollama Connection Failed

1. Verify Ollama is running: `ollama --version`
2. Check endpoint URL in configuration
3. Test with curl: `curl http://localhost:11434/api/tags`

### Gateway Connection Issues

1. Check WebSocket URL is correct
2. Verify token if authentication enabled
3. Check firewall settings

### Agent Not Responding

1. Check agent health in dashboard
2. Verify model is available
3. Review agent logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

- Documentation: [docs.openclaw.io](https://docs.openclaw.io)
- Issues: [GitHub Issues](https://github.com/openclaw/next/issues)
- Discord: [Join our community](https://discord.gg/openclaw)

---

**Built with ❤️ using TypeScript, React, Vite, and Ollama**
