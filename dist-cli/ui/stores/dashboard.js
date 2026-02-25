import axios from "axios";
import { create } from "zustand";
const API_BASE_URL = "/api";
export const useDashboardStore = create((set) => ({
    stats: null,
    agents: [],
    tasks: [],
    approvals: [],
    auditLogs: [],
    loading: false,
    error: null,
    fetchStats: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/stats`);
            if (response.data.success) {
                set({ stats: response.data.data });
            }
        }
        catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    },
    fetchAgents: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/agents`);
            if (response.data.success) {
                set({ agents: response.data.data });
            }
        }
        catch (error) {
            console.error("Failed to fetch agents:", error);
        }
    },
    fetchTasks: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/delegations`);
            if (response.data.success) {
                set({ tasks: response.data.data });
            }
        }
        catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    },
    fetchApprovals: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/approvals`);
            if (response.data.success) {
                set({ approvals: response.data.data });
            }
        }
        catch (error) {
            console.error("Failed to fetch approvals:", error);
        }
    },
    fetchAuditLogs: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/audit`);
            if (response.data.success) {
                set({ auditLogs: response.data.data });
            }
        }
        catch (error) {
            console.error("Failed to fetch audit logs:", error);
        }
    },
    setStats: (newStats) => set((state) => ({
        stats: state.stats ? { ...state.stats, ...newStats } : newStats,
    })),
}));
