/**
 * OpenClaw Next - Analytics Collector
 * Metrics collection and tracking for agents, skills, and tools
 */
/**
 * Analytics Collector
 * Collects and stores metrics from all system components
 */
export class AnalyticsCollector {
    agentMetrics = new Map();
    systemMetrics = [];
    metricSeries = new Map();
    maxHistoryPoints = 1000;
    constructor() {
        this.initializeDefaultSeries();
    }
    /**
     * Initialize default metric series
     */
    initializeDefaultSeries() {
        this.metricSeries.set('agent_runs', {
            name: 'agent_runs',
            description: 'Total agent runs over time',
            unit: 'count',
            data: [],
        });
        this.metricSeries.set('tool_invocations', {
            name: 'tool_invocations',
            description: 'Tool invocations per minute',
            unit: 'count',
            data: [],
        });
        this.metricSeries.set('skill_invocations', {
            name: 'skill_invocations',
            description: 'Skill invocations per minute',
            unit: 'count',
            data: [],
        });
        this.metricSeries.set('memory_usage', {
            name: 'memory_usage',
            description: 'System memory usage',
            unit: 'MB',
            data: [],
        });
        this.metricSeries.set('execution_time', {
            name: 'execution_time',
            description: 'Average agent execution time',
            unit: 'ms',
            data: [],
        });
    }
    /**
     * Record agent event
     */
    recordAgentEvent(event) {
        switch (event.type) {
            case 'agent_run_completed':
                this.recordRunCompletion(event.agentId, event.result.success);
                break;
            case 'agent_spawned':
                this.initializeAgentMetrics(event.agentId);
                break;
            case 'agent_terminated':
                this.archiveAgentMetrics(event.agentId);
                break;
        }
    }
    /**
     * Record tool event
     */
    recordToolEvent(event) {
        this.addMetricPoint('tool_invocations', 1, {
            toolId: event.toolId,
            eventType: event.type,
        });
    }
    /**
     * Record skill invocation
     */
    recordSkillInvocation(agentId, skillId, durationMs) {
        const metrics = this.agentMetrics.get(agentId);
        if (metrics) {
            metrics.skillsInvoked[skillId] = (metrics.skillsInvoked[skillId] || 0) + 1;
        }
        this.addMetricPoint('skill_invocations', 1, {
            agentId,
            skillId,
        });
        this.addMetricPoint('execution_time', durationMs, {
            agentId,
            skillId,
        });
    }
    /**
     * Record system metrics snapshot
     */
    recordSystemMetrics(metrics) {
        const snapshot = {
            timestamp: Date.now(),
            activeAgents: metrics.activeAgents || 0,
            totalAgents: metrics.totalAgents || 0,
            skillsRegistered: metrics.skillsRegistered || 0,
            toolsEnabled: metrics.toolsEnabled || 0,
            memoryUsage: metrics.memoryUsage || 0,
            cpuUsage: metrics.cpuUsage || 0,
            requestsPerMinute: metrics.requestsPerMinute || 0,
        };
        this.systemMetrics.push(snapshot);
        // Keep only last 24 hours of data
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        this.systemMetrics = this.systemMetrics.filter(m => m.timestamp > dayAgo);
    }
    /**
     * Get agent metrics
     */
    getAgentMetrics(agentId) {
        return this.agentMetrics.get(agentId);
    }
    /**
     * Get all agent metrics
     */
    getAllAgentMetrics() {
        return Array.from(this.agentMetrics.values());
    }
    /**
     * Get system metrics for time range
     */
    getSystemMetrics(startTime, endTime) {
        return this.systemMetrics.filter(m => m.timestamp >= startTime && m.timestamp <= endTime);
    }
    /**
     * Get metric series
     */
    getMetricSeries(name, startTime, endTime) {
        const series = this.metricSeries.get(name);
        if (!series)
            return undefined;
        if (startTime || endTime) {
            const filtered = series.data.filter(p => (!startTime || p.timestamp >= startTime) &&
                (!endTime || p.timestamp <= endTime));
            return { ...series, data: filtered };
        }
        return series;
    }
    /**
     * Get aggregated statistics
     */
    getAggregatedStats(timeRange) {
        const now = Date.now();
        const rangeMs = {
            '1h': 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
        }[timeRange];
        const startTime = now - rangeMs;
        // Aggregate agent metrics
        let totalRuns = 0;
        let totalFailures = 0;
        let totalExecutionTime = 0;
        const skillCounts = {};
        const toolCounts = {};
        this.agentMetrics.forEach(metrics => {
            totalRuns += metrics.runsCompleted;
            totalFailures += metrics.runsFailed;
            totalExecutionTime += metrics.avgExecutionTime * metrics.runsCompleted;
            Object.entries(metrics.skillsInvoked).forEach(([skillId, count]) => {
                skillCounts[skillId] = (skillCounts[skillId] || 0) + count;
            });
            Object.entries(metrics.toolsUsed).forEach(([toolId, count]) => {
                toolCounts[toolId] = (toolCounts[toolId] || 0) + count;
            });
        });
        // Get active agents trend
        const activeAgentsTrend = this.systemMetrics
            .filter(m => m.timestamp >= startTime)
            .map(m => ({
            timestamp: m.timestamp,
            count: m.activeAgents,
        }));
        return {
            totalRuns,
            successRate: totalRuns > 0 ? (totalRuns - totalFailures) / totalRuns : 0,
            avgExecutionTime: totalRuns > 0 ? totalExecutionTime / totalRuns : 0,
            topSkills: Object.entries(skillCounts)
                .map(([skillId, count]) => ({ skillId, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10),
            topTools: Object.entries(toolCounts)
                .map(([toolId, count]) => ({ toolId, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10),
            activeAgentsTrend,
        };
    }
    /**
     * Export metrics to JSON
     */
    exportMetrics(format = 'json') {
        const data = {
            agentMetrics: Array.from(this.agentMetrics.entries()),
            systemMetrics: this.systemMetrics,
            metricSeries: Array.from(this.metricSeries.entries()),
            exportedAt: new Date().toISOString(),
        };
        if (format === 'csv') {
            return this.convertToCSV(data);
        }
        return JSON.stringify(data, null, 2);
    }
    /**
     * Clear all metrics
     */
    clearMetrics() {
        this.agentMetrics.clear();
        this.systemMetrics = [];
        this.metricSeries.forEach(series => {
            series.data = [];
        });
    }
    // Private helper methods
    initializeAgentMetrics(agentId) {
        this.agentMetrics.set(agentId, {
            agentId,
            runsCompleted: 0,
            runsFailed: 0,
            avgExecutionTime: 0,
            totalTokensUsed: 0,
            skillsInvoked: {},
            toolsUsed: {},
            lastActive: Date.now(),
        });
    }
    recordRunCompletion(agentId, success) {
        const metrics = this.agentMetrics.get(agentId);
        if (!metrics)
            return;
        if (success) {
            metrics.runsCompleted++;
        }
        else {
            metrics.runsFailed++;
        }
        metrics.lastActive = Date.now();
        this.addMetricPoint('agent_runs', 1, {
            agentId,
            success: success ? 'true' : 'false',
        });
    }
    archiveAgentMetrics(agentId) {
        // Could persist to storage here
        this.agentMetrics.delete(agentId);
    }
    addMetricPoint(seriesName, value, labels = {}) {
        const series = this.metricSeries.get(seriesName);
        if (!series)
            return;
        series.data.push({
            timestamp: Date.now(),
            value,
            labels,
        });
        // Keep only recent data points
        if (series.data.length > this.maxHistoryPoints) {
            series.data = series.data.slice(-this.maxHistoryPoints);
        }
    }
    convertToCSV(data) {
        // Simplified CSV conversion
        return 'timestamp,metric,value\n';
    }
}
/**
 * Global analytics collector instance
 */
export const analyticsCollector = new AnalyticsCollector();
