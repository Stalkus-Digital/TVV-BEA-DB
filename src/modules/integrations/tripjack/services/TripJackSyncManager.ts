import { prisma } from '@/shared/database/prisma-client';
import { TripJackQueues } from '../queue';


export class TripJackSyncManager {
  
  /**
   * Starts a new synchronization lifecycle.
   */
  async startSync(): Promise<string> {
    const existing = await prisma.tjSyncExecution.findFirst({
      where: { status: { in: ['PENDING', 'RUNNING', 'PAUSED'] } }
    });

    if (existing) {
      throw new Error(`Sync already in progress with ID: ${existing.executionId}`);
    }

    const executionId = `SYNC-${Date.now()}`;
    await prisma.tjSyncExecution.create({
      data: {
        executionId,
        status: 'RUNNING',
        currentStage: 'COUNTRIES',
      }
    });

    // Initiate Phase 2: Countries
    await TripJackQueues.countries.add('sync-countries', { executionId });

    return executionId;
  }

  /**
   * Pauses the active sync.
   */
  async pauseSync(): Promise<void> {
    const active = await this.getActiveExecution();
    if (!active) throw new Error('No active sync to pause.');

    await prisma.tjSyncExecution.update({
      where: { id: active.id },
      data: { status: 'PAUSED' }
    });
    
    // In a full implementation, workers would check this status and safely exit.
  }

  /**
   * Resumes a paused or failed sync from the exact checkpoint.
   */
  async resumeSync(executionId: string): Promise<void> {
    const execution = await prisma.tjSyncExecution.findUnique({ where: { executionId } });
    if (!execution) throw new Error('Execution not found.');
    if (execution.status === 'RUNNING') throw new Error('Already running.');

    await prisma.tjSyncExecution.update({
      where: { id: execution.id },
      data: { status: 'RUNNING' }
    });

    // Re-queue the job based on current stage
    switch (execution.currentStage) {
      case 'COUNTRIES':
        await TripJackQueues.countries.add('sync-countries', { executionId });
        break;
      case 'CITIES':
        await TripJackQueues.cities.add('sync-cities', { executionId });
        break;
      case 'MAPPINGS':
        await TripJackQueues.mappings.add('sync-mappings', { executionId });
        break;
      case 'CONTENT':
        await TripJackQueues.content.add('sync-content', { executionId });
        break;
      default:
        throw new Error('Unknown stage');
    }
  }

  /**
   * Hard stop and fail the current sync.
   */
  async stopSync(): Promise<void> {
    const active = await this.getActiveExecution();
    if (!active) return;
    
    await prisma.tjSyncExecution.update({
      where: { id: active.id },
      data: { status: 'PAUSED', errorDetails: 'Stopped manually by admin.' }
    });
  }

  async getStatus() {
    const active = await prisma.tjSyncExecution.findFirst({
      orderBy: { startedAt: 'desc' },
      take: 1
    });
    
    if (!active) return null;
    
    const checkpoint = await prisma.tjSyncCheckpoint.findUnique({
      where: { executionId_stage: { executionId: active.executionId, stage: active.currentStage } }
    });

    return {
      execution: active,
      checkpoint: checkpoint
    };
  }

  private async getActiveExecution() {
    return prisma.tjSyncExecution.findFirst({
      where: { status: { in: ['PENDING', 'RUNNING', 'PAUSED'] } }
    });
  }
}

