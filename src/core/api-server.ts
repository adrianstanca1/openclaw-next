/**
 * OpenClaw Next - Smart API Server
 * REST API + WebSocket server for agent management, skills, and delegation
 */

import { EventEmitter } from "events";
import http from "http";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import { WebSocketServer, WebSocket } from "ws";
import { AgentManager } from "../agents/manager.js";
import { AgentState, type AgentConfig, type DelegationRequest } from "../agents/types.js";
import { SkillsManager } from "../skills/manager.js";
import type { InstalledSkill, SkillDefinition } from "../skills/types.js";
import { configManager, type AppConfig } from "./config.js";
import { ollamaClient, type ConnectionStatus } from "./ollama.js";
import { selfHealingSystem } from "./self-healing.js";
import { generateId, formatDuration } from "./utils.js";

export enum ServerState {
  STOPPED = "stopped",
  STARTING = "starting",
  RUNNING = "running",
  PAUSED = "paused",
  ERROR = "error",
}

export interface ServerHealth {
  state: ServerState;
  uptime: number;
  startedAt?: string;
  lastError?: string;
  connections: {
    total: number;
    active: number;
    websocket: number;
    http: number;
  };
  resources: {
    memory: number;
    cpu: number;
    requestsPerMinute: number;
  };
}

export interface AgentTask {
  id: string;
  type: "reasoning" | "execution" | "delegation" | "monitoring";
  priority: number;
  status: "pending" | "processing" | "completed" | "failed";
  agentId?: string;
  assignedAgent?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  deadline?: string;
  input: string;
  payload?: {
    fromAgent?: string;
    fromAgentName?: string;
    task?: string;
    description?: string;
    [key: string]: unknown;
  };
  context?: Record<string, unknown>;
  dependencies?: string[];
  result?: unknown;
  error?: string;
}

export interface DelegationResult {
  success: boolean;
  taskId: string;
  output?: string;
  error?: string;
  duration: number;
  tokensUsed?: number;
  toolsUsed?: string[];
  reasoning?: string;
}

interface SubagentConfig {
  id: string;
  role: "worker" | "specialist" | "coordinator" | "validator";
  capabilities: string[];
  maxConcurrent: number;
  priority: number;
  tools: string[];
  skills: string[];
  parentId?: string;
}

interface WebSocketClient {
  id: string;
  send: (data: string) => void;
  close: () => void;
}

interface Approval {
  id: string;
  type: "task" | "agent_spawn" | "skill_install" | "delegation" | "config_change";
  requester: string;
  requesterId: string;
  description: string;
  priority: "low" | "normal" | "high" | "critical";
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedAt?: string;
  reviewer?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  teamId?: string;
}

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  actorId: string;
  target: string;
  targetId: string;
  details: Record<string, unknown>;
  timestamp: string;
  severity: "info" | "warning" | "error" | "critical";
}

export class SmartApiServer extends EventEmitter {
  private state: ServerState = ServerState.STOPPED;
  private startedAt?: Date;
  private health: ServerHealth;
  private clients: Map<string, WebSocketClient> = new Map();
  private taskQueue: AgentTask[] = [];
  private subagents: Map<string, SubagentConfig> = new Map();
  private requestCount: number = 0;
  private abortController: AbortController | null = null;
  private app: express.Application;
  private server?: http.Server;
  private wss?: WebSocketServer;
  private port: number = Number(process.env.PORT) || 18789;
  private agentManager: AgentManager;
  private skillsManager: SkillsManager;
  private approvals: Approval[] = [];
  private auditLogs: AuditLog[] = [];

  constructor(agentManager?: AgentManager, skillsManager?: SkillsManager) {
    super();
    this.agentManager = agentManager || new AgentManager();
    this.skillsManager = skillsManager || new SkillsManager();
    this.app = express();
    this.health = {
      state: ServerState.STOPPED,
      uptime: 0,
      connections: { total: 0, active: 0, websocket: 0, http: 0 },
      resources: { memory: 0, cpu: 0, requestsPerMinute: 0 },
    };

    this.setupMiddleware();
    this.setupRoutes();
    this.initializeSubagents();
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize with sample approvals
    this.approvals = [
      {
        id: "app-1",
        type: "agent_spawn" as const,
        requester: "John Doe",
        requesterId: "user-1",
        description: "Spawn a new Data Processing agent",
        priority: "high" as const,
        status: "pending" as const,
        requestedAt: new Date(Date.now() - 3600000).toISOString(),
        teamId: "team-1",
        metadata: { model: "llama3.1", capabilities: ["data-processing"] },
      },
      {
        id: "app-2",
        type: "skill_install" as const,
        requester: "Jane Smith",
        requesterId: "user-2",
        description: "Install Web Scraper skill",
        priority: "normal" as const,
        status: "pending" as const,
        requestedAt: new Date(Date.now() - 7200000).toISOString(),
        teamId: "team-1",
        metadata: { skillId: "web-scraper", agentId: "agent-15" },
      },
    ];

    // Initialize with sample audit logs
    this.auditLogs = [
      {
        id: "log-1",
        action: "Agent spawned",
        actor: "Admin",
        actorId: "admin",
        target: "Agent-1",
        targetId: "agent-1",
        details: {},
        timestamp: new Date().toISOString(),
        severity: "info" as const,
      },
    ];
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      this.requestCount++;
      this.health.connections.http++;
      this.health.connections.total++;
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get("/api/health", (req: Request, res: Response) => {
      res.json({
        success: true,
        data: {
          state: this.state,
          uptime: this.startedAt ? Date.now() - this.startedAt.getTime() : 0,
          startedAt: this.startedAt?.toISOString(),
          connections: this.health.connections,
        },
      });
    });

    // ============ AGENT ROUTES ============

    // Get all agents
    this.app.get("/api/agents", (req: Request, res: Response) => {
      try {
        const agents = this.agentManager.getAllAgents().map((agent) => ({
          id: agent.id,
          name: agent.config.name,
          role: agent.config.role,
          model: agent.config.model,
          state: agent.state,
          runsCompleted: agent.runsCompleted,
          uptimeMs: agent.uptimeMs,
          capabilities: agent.config.capabilities,
        }));
        res.json({ success: true, data: agents });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Get agent by ID
    this.app.get("/api/agents/:id", (req: Request, res: Response) => {
      try {
        const agentId = Array.isArray(
          Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
        )
          ? Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id[0]
          : Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;
        const agent = this.agentManager.getAgent(agentId);
        if (!agent) {
          return res.status(404).json({ success: false, error: "Agent not found" });
        }
        const health = this.agentManager.getAgentHealth(agentId);
        res.json({
          success: true,
          data: { ...agent, health },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Spawn new agent
    this.app.post("/api/agents", async (req: Request, res: Response) => {
      try {
        const config: AgentConfig = req.body;
        const agent = await this.agentManager.spawnAgent(config);
        res.status(201).json({ success: true, data: agent });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Terminate agent
    this.app.delete("/api/agents/:id", async (req: Request, res: Response) => {
      try {
        const agentId = Array.isArray(
          Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
        )
          ? Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id[0]
          : Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;
        await this.agentManager.terminateAgent(agentId, "api_request");
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Suspend agent
    this.app.post("/api/agents/:id/suspend", async (req: Request, res: Response) => {
      try {
        const agentId = Array.isArray(
          Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
        )
          ? Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id[0]
          : Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;
        await this.agentManager.suspendAgent(agentId);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Resume agent
    this.app.post("/api/agents/:id/resume", async (req: Request, res: Response) => {
      try {
        const agentId = Array.isArray(
          Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
        )
          ? Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id[0]
          : Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;
        await this.agentManager.resumeAgent(agentId);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // ============ AGENT GROUPS ============

    // Get all groups
    this.app.get("/api/groups", (req: Request, res: Response) => {
      try {
        const groups = this.agentManager.getAllAgentGroups();
        res.json({ success: true, data: groups });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Create group
    this.app.post("/api/groups", (req: Request, res: Response) => {
      try {
        const group = this.agentManager.createAgentGroup(req.body);
        res.status(201).json({ success: true, data: group });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // ============ DELEGATION ROUTES ============

    // Get all delegations/tasks
    this.app.get("/api/delegations", (req: Request, res: Response) => {
      res.json({
        success: true,
        data: this.taskQueue,
      });
    });

    // Create delegation/task
    this.app.post("/api/delegations", async (req: Request, res: Response) => {
      try {
        const delegation: DelegationRequest = {
          id: generateId("del"),
          ...req.body,
        };

        // Add to task queue
        const task: AgentTask = {
          id: delegation.id,
          type: "delegation",
          priority: this.getPriorityValue(delegation.priority),
          status: "pending",
          agentId: delegation.toAgent,
          assignedAgent: delegation.toAgent,
          assignedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          input: delegation.input,
          payload: {
            fromAgent: delegation.fromAgent,
            task: delegation.task,
            description: delegation.task,
          },
          context: delegation.context,
        };

        this.taskQueue.push(task);

        // Actually delegate through agent manager
        await this.agentManager.delegateTask(delegation);

        this.broadcast("delegation_created", { delegation, task });

        res.status(201).json({ success: true, data: { delegation, task } });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Get delegation by ID
    this.app.get("/api/delegations/:id", (req: Request, res: Response) => {
      const reqId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const task = this.taskQueue.find((t) => t.id === reqId);
      if (!task) {
        return res.status(404).json({ success: false, error: "Delegation not found" });
      }
      res.json({ success: true, data: task });
    });

    // ============ SKILLS ROUTES ============

    // Get all skills (marketplace)
    this.app.get("/api/skills", (req: Request, res: Response) => {
      try {
        const skills = this.skillsManager.listSkillDefinitions();
        res.json({ success: true, data: skills });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Get installed skills
    this.app.get("/api/skills/installed", (req: Request, res: Response) => {
      try {
        const skills = this.skillsManager.getInstalledSkills();
        res.json({ success: true, data: skills });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Get skill by ID
    this.app.get("/api/skills/:id", (req: Request, res: Response) => {
      try {
        const skillId = Array.isArray(
          Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
        )
          ? Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id[0]
          : Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;
        const skill = this.skillsManager.getSkillDefinition(skillId);
        if (!skill) {
          return res.status(404).json({ success: false, error: "Skill not found" });
        }
        res.json({ success: true, data: skill });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Install skill
    this.app.post("/api/skills/:id/install", async (req: Request, res: Response) => {
      try {
        const skill = await this.skillsManager.installSkill(
          Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
          req.body,
        );
        res.status(201).json({ success: true, data: skill });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Enable skill for agent
    this.app.post("/api/skills/:instanceId/enable", async (req: Request, res: Response) => {
      try {
        const { agentId } = req.body;
        await this.skillsManager.enableSkill(
          Array.isArray(
            Array.isArray(req.params.instanceId) ? req.params.instanceId[0] : req.params.instanceId,
          )
            ? Array.isArray(req.params.instanceId)
              ? req.params.instanceId[0]
              : req.params.instanceId[0]
            : Array.isArray(req.params.instanceId)
              ? req.params.instanceId[0]
              : req.params.instanceId,
          agentId,
        );
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Disable skill for agent
    this.app.post("/api/skills/:instanceId/disable", async (req: Request, res: Response) => {
      try {
        const { agentId } = req.body;
        await this.skillsManager.disableSkill(
          Array.isArray(
            Array.isArray(req.params.instanceId) ? req.params.instanceId[0] : req.params.instanceId,
          )
            ? Array.isArray(req.params.instanceId)
              ? req.params.instanceId[0]
              : req.params.instanceId[0]
            : Array.isArray(req.params.instanceId)
              ? req.params.instanceId[0]
              : req.params.instanceId,
          agentId,
        );
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Uninstall skill
    this.app.delete("/api/skills/:instanceId", async (req: Request, res: Response) => {
      try {
        await this.skillsManager.uninstallSkill(
          Array.isArray(
            Array.isArray(req.params.instanceId) ? req.params.instanceId[0] : req.params.instanceId,
          )
            ? Array.isArray(req.params.instanceId)
              ? req.params.instanceId[0]
              : req.params.instanceId[0]
            : Array.isArray(req.params.instanceId)
              ? req.params.instanceId[0]
              : req.params.instanceId,
        );
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // ============ AGENT SKILLS ============

    // Get skills for specific agent
    this.app.get("/api/agents/:id/skills", (req: Request, res: Response) => {
      try {
        const skills = this.skillsManager.getAgentSkills(
          Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
        );
        res.json({ success: true, data: skills });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // ============ APPROVALS ============

    // Get all approvals
    this.app.get("/api/approvals", (req: Request, res: Response) => {
      try {
        const { status, priority, type } = req.query;
        let filtered = this.approvals;

        if (status) {
          filtered = filtered.filter((a) => a.status === status);
        }
        if (priority) {
          filtered = filtered.filter((a) => a.priority === priority);
        }
        if (type) {
          filtered = filtered.filter((a) => a.type === type);
        }

        res.json({ success: true, data: filtered });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Get approval by ID
    this.app.get("/api/approvals/:id", (req: Request, res: Response) => {
      try {
        const approvalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const approval = this.approvals.find((a) => a.id === approvalId);
        if (!approval) {
          return res.status(404).json({ success: false, error: "Approval not found" });
        }
        res.json({ success: true, data: approval });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Create approval request
    this.app.post("/api/approvals", (req: Request, res: Response) => {
      try {
        const approval = {
          id: generateId("app"),
          status: "pending",
          requestedAt: new Date().toISOString(),
          ...req.body,
        };
        this.approvals.push(approval);
        res.status(201).json({ success: true, data: approval });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Approve request
    this.app.post("/api/approvals/:id/approve", (req: Request, res: Response) => {
      try {
        const approvalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { reason } = req.body;
        const approval = this.approvals.find((a) => a.id === approvalId);

        if (!approval) {
          return res.status(404).json({ success: false, error: "Approval not found" });
        }

        if (approval.status !== "pending") {
          return res.status(400).json({ success: false, error: "Approval already processed" });
        }

        approval.status = "approved";
        approval.reviewedAt = new Date().toISOString();
        approval.reviewer = "Admin";
        approval.reason = reason;

        this.broadcast("approval_approved", { approval });
        res.json({ success: true, data: approval });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Reject request
    this.app.post("/api/approvals/:id/reject", (req: Request, res: Response) => {
      try {
        const approvalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { reason } = req.body;
        const approval = this.approvals.find((a) => a.id === approvalId);

        if (!approval) {
          return res.status(404).json({ success: false, error: "Approval not found" });
        }

        if (approval.status !== "pending") {
          return res.status(400).json({ success: false, error: "Approval already processed" });
        }

        approval.status = "rejected";
        approval.reviewedAt = new Date().toISOString();
        approval.reviewer = "Admin";
        approval.reason = reason;

        this.broadcast("approval_rejected", { approval });
        res.json({ success: true, data: approval });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // ============ OLLAMA STATUS ============

    this.app.get("/api/ollama/status", async (req: Request, res: Response) => {
      try {
        const status = await ollamaClient.checkConnection();
        res.json({ success: true, data: status });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // ============ STATS ============

    this.app.get("/api/stats", (req: Request, res: Response) => {
      try {
        const agents = this.agentManager.getAllAgents();
        const pendingApprovals = this.approvals.filter((a) => a.status === "pending").length;
        const criticalApprovals = this.approvals.filter(
          (a) => a.status === "pending" && a.priority === "critical",
        ).length;

        res.json({
          success: true,
          data: {
            totalAgents: agents.length,
            activeAgents: agents.filter((a) => a.state === "active").length,
            totalTasks: this.taskQueue.length,
            pendingTasks: this.taskQueue.filter((t) => t.status === "pending").length,
            totalTeams: 1,
            onlineGateways: 1,
            pendingApprovals,
            criticalApprovals,
            systemHealth: agents.length > 0 ? "healthy" : "degraded",
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // ============ APPROVALS ============

    // Get all approvals
    this.app.get("/api/approvals", (req: Request, res: Response) => {
      try {
        res.json({ success: true, data: this.approvals });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Get approval by ID
    this.app.get("/api/approvals/:id", (req: Request, res: Response) => {
      try {
        const approvalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const approval = this.approvals.find((a) => a.id === approvalId);
        if (!approval) {
          return res.status(404).json({ success: false, error: "Approval not found" });
        }
        res.json({ success: true, data: approval });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Create approval request
    this.app.post("/api/approvals", (req: Request, res: Response) => {
      try {
        const approval = {
          id: generateId("app"),
          ...req.body,
          status: "pending",
          requestedAt: new Date().toISOString(),
        };
        this.approvals.push(approval);
        this.broadcast("approval_created", { approval });
        res.status(201).json({ success: true, data: approval });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Approve request
    this.app.post("/api/approvals/:id/approve", (req: Request, res: Response) => {
      try {
        const approvalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const approval = this.approvals.find((a) => a.id === approvalId);
        if (!approval) {
          return res.status(404).json({ success: false, error: "Approval not found" });
        }
        approval.status = "approved";
        approval.reviewedAt = new Date().toISOString();
        approval.reviewer = req.body.reviewer || "system";
        approval.reason = req.body.reason;
        this.broadcast("approval_approved", { approval });
        res.json({ success: true, data: approval });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Reject request
    this.app.post("/api/approvals/:id/reject", (req: Request, res: Response) => {
      try {
        const approvalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const approval = this.approvals.find((a) => a.id === approvalId);
        if (!approval) {
          return res.status(404).json({ success: false, error: "Approval not found" });
        }
        approval.status = "rejected";
        approval.reviewedAt = new Date().toISOString();
        approval.reviewer = req.body.reviewer || "system";
        approval.reason = req.body.reason;
        this.broadcast("approval_rejected", { approval });
        res.json({ success: true, data: approval });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // ============ AUDIT LOG ============

    // Get audit logs
    this.app.get("/api/audit", (req: Request, res: Response) => {
      try {
        const limit = parseInt(req.query.limit as string) || 100;
        const logs = this.auditLogs.slice(-limit);
        res.json({ success: true, data: logs });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // ============ STATS ============

    // Get dashboard stats
    this.app.get("/api/stats", (req: Request, res: Response) => {
      try {
        const agents = this.agentManager.getAllAgents();
        const stats = {
          totalAgents: agents.length,
          activeAgents: agents.filter((a) => a.state === "active").length,
          totalTasks: this.taskQueue.length,
          pendingTasks: this.taskQueue.filter((t) => t.status === "pending").length,
          totalTeams: 1,
          onlineGateways: this.state === ServerState.RUNNING ? 1 : 0,
          pendingApprovals: this.approvals.filter((a) => a.status === "pending").length,
          systemHealth: this.state === ServerState.RUNNING ? "healthy" : "degraded",
        };
        res.json({ success: true, data: stats });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Catch-all 404
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ success: false, error: "Not found" });
    });
  }

  private getPriorityValue(priority: string): number {
    switch (priority) {
      case "critical":
        return 4;
      case "high":
        return 3;
      case "normal":
        return 2;
      case "low":
        return 1;
      default:
        return 2;
    }
  }

  async start(): Promise<void> {
    if (this.state !== ServerState.STOPPED) {
      throw new Error("Server is already running");
    }

    this.state = ServerState.STARTING;
    this.emit("starting", { timestamp: new Date().toISOString() });

    try {
      await configManager.load();
      const ollamaStatus = await ollamaClient.checkConnection();

      // Start HTTP server
      this.server = http.createServer(this.app);

      // Start WebSocket server
      this.wss = new WebSocketServer({ server: this.server });

      this.wss.on("connection", (ws: WebSocket, req) => {
        const clientId = generateId("client");
        console.log(`[WebSocket] Client ${clientId} connected`);

        this.clients.set(clientId, {
          id: clientId,
          send: (data: string) => ws.send(data),
          close: () => ws.close(),
        });

        this.health.connections.websocket++;
        this.health.connections.total++;

        ws.on("message", (data: Buffer) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleWebSocketMessage(clientId, message);
          } catch (e) {
            console.error("[WebSocket] Invalid message:", e);
          }
        });

        ws.on("close", () => {
          console.log(`[WebSocket] Client ${clientId} disconnected`);
          this.clients.delete(clientId);
          this.health.connections.websocket--;
          this.health.connections.total--;
        });

        // Send welcome message
        ws.send(
          JSON.stringify({
            type: "connected",
            clientId,
            timestamp: new Date().toISOString(),
          }),
        );
      });

      // Start listening
      await new Promise<void>((resolve) => {
        this.server?.listen(this.port, () => {
          console.log(`[Server] HTTP + WebSocket listening on port ${this.port}`);
          resolve();
        });
      });

      // Start agent manager
      await this.agentManager.start();

      // Start self-healing system
      selfHealingSystem.start();
      console.log("[Server] Self-healing system enabled");

      this.startHealthMonitoring();

      this.state = ServerState.RUNNING;
      this.startedAt = new Date();
      this.health.state = ServerState.RUNNING;
      this.health.startedAt = this.startedAt.toISOString();

      this.emit("started", {
        timestamp: this.startedAt.toISOString(),
        ollamaConnected: ollamaStatus.connected,
      });

      console.log("Smart API Server started");
    } catch (error) {
      this.state = ServerState.ERROR;
      this.health.state = ServerState.ERROR;
      this.health.lastError = error instanceof Error ? error.message : "Unknown error";
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state === ServerState.STOPPED) return;

    this.state = ServerState.STOPPED;
    this.health.state = ServerState.STOPPED;

    // Close all WebSocket clients
    for (const client of this.clients.values()) {
      client.close();
    }
    this.clients.clear();
    this.taskQueue = [];

    // Stop agent manager
    await this.agentManager.stop();

    // Close WebSocket server
    this.wss?.close();

    // Close HTTP server
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server?.close(() => resolve());
      });
    }

    this.emit("stopped", { timestamp: new Date().toISOString() });
    console.log("Smart API Server stopped");
  }

  private handleWebSocketMessage(clientId: string, message: any): void {
    switch (message.type) {
      case "message":
        // Handle chat message
        this.broadcast("message_received", {
          ...message,
          sender: "user",
          timestamp: new Date().toISOString(),
        });
        break;
      case "ping":
        const client = this.clients.get(clientId);
        if (client) {
          client.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
        }
        break;
      default:
        console.log(`[WebSocket] Unknown message type: ${message.type}`);
    }
  }

  broadcast(type: string, data: any): void {
    const message = JSON.stringify({
      type,
      payload: data,
      timestamp: new Date().toISOString(),
    });

    for (const client of this.clients.values()) {
      try {
        client.send(message);
      } catch (e) {
        console.error(`[WebSocket] Failed to send to ${client.id}:`, e);
      }
    }

    this.emit(type, data);
  }

  private initializeSubagents(): void {
    // Initialize with default subagents
    this.subagents.set("worker-1", {
      id: "worker-1",
      role: "worker",
      capabilities: ["execution", "tool_use"],
      maxConcurrent: 5,
      priority: 1,
      tools: [],
      skills: [],
    });
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      this.health.uptime = this.startedAt ? Date.now() - this.startedAt.getTime() : 0;
      this.broadcast("health-check", this.health);
    }, 30000);
  }

  getHealth() {
    return this.health;
  }
}

export const apiServer = new SmartApiServer();
export const smartApiServer = apiServer;
