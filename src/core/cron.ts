/**
 * OpenClaw Next - Dynamic Cron Manager
 * Allows the agent to schedule autonomous background tasks
 */

import { EventEmitter } from 'events';

export interface CronJob {
  id: string;
  expression: string; // e.g. '0 * * * *' (hourly)
  task: string;
  lastRun?: string;
  enabled: boolean;
}

export class CronManager extends EventEmitter {
  private jobs: Map<string, CronJob> = new Map();

  constructor() {
    super();
    this.startScheduler();
  }

  private startScheduler() {
    // Every minute, check for eligible jobs
    setInterval(() => {
      this.tick();
    }, 60000);
  }

  private tick() {
    const now = new Date();
    console.log(`[Cron] Checking jobs at ${now.toISOString()}...`);
    
    for (const job of this.jobs.values()) {
      if (job.enabled) {
        // In a real implementation, use 'cron-parser' to check if 'now' matches job.expression
        this.executeJob(job);
      }
    }
  }

  private async executeJob(job: CronJob) {
    console.log(`[Cron] Executing job ${job.id}: ${job.task}`);
    this.emit('job_triggered', job);
    job.lastRun = new Date().toISOString();
  }

  /**
   * API for the agent to register a job
   */
  registerJob(job: CronJob) {
    this.jobs.set(job.id, job);
    console.log(`[Cron] Job ${job.id} registered: ${job.expression}`);
  }

  removeJob(id: string) {
    this.jobs.delete(id);
  }
}

export const cronManager = new CronManager();
