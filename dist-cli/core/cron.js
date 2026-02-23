/**
 * OpenClaw Next - Dynamic Cron Manager
 * Allows the agent to schedule autonomous background tasks
 */
import { EventEmitter } from 'events';
export class CronManager extends EventEmitter {
    jobs = new Map();
    constructor() {
        super();
        this.startScheduler();
    }
    startScheduler() {
        // Every minute, check for eligible jobs
        setInterval(() => {
            this.tick();
        }, 60000);
    }
    tick() {
        const now = new Date();
        console.log(`[Cron] Checking jobs at ${now.toISOString()}...`);
        for (const job of this.jobs.values()) {
            if (job.enabled) {
                // In a real implementation, use 'cron-parser' to check if 'now' matches job.expression
                this.executeJob(job);
            }
        }
    }
    async executeJob(job) {
        console.log(`[Cron] Executing job ${job.id}: ${job.task}`);
        this.emit('job_triggered', job);
        job.lastRun = new Date().toISOString();
    }
    /**
     * API for the agent to register a job
     */
    registerJob(job) {
        this.jobs.set(job.id, job);
        console.log(`[Cron] Job ${job.id} registered: ${job.expression}`);
    }
    removeJob(id) {
        this.jobs.delete(id);
    }
}
export const cronManager = new CronManager();
