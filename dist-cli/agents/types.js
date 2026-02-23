// OpenClaw Next - Agents Module Types
// Superintelligence Agentic Gateway System
void 0;
/**
 * Agent State Enumeration
 * Represents all possible states in an agent's lifecycle
 */
export var AgentState;
(function (AgentState) {
    AgentState["IDLE"] = "idle";
    AgentState["INITIALIZING"] = "initializing";
    AgentState["ACTIVE"] = "active";
    AgentState["THINKING"] = "thinking";
    AgentState["ACTING"] = "acting";
    AgentState["OBSERVING"] = "observing";
    AgentState["WAITING"] = "waiting";
    AgentState["FINISHED"] = "finished";
    AgentState["ERROR"] = "error";
    AgentState["TERMINATED"] = "terminated";
    AgentState["SUSPENDED"] = "suspended";
})(AgentState || (AgentState = {}));
