import { Job } from 'bullmq';
import { prisma } from '@/shared/database/prisma-client';
import { TripJackBatchService } from '../services/TripJackBatchService';
import { TripJackQueues } from '../queue';

const batchService = new TripJackBatchService();

export async function SyncCitiesJob(job: Job): Promise<void> {
  const { executionId } = job.data;
  if (!executionId) throw new Error('Missing executionId in job payload.');

  console.log(`[TripJack Worker] Processing Cities Sync for execution: ${executionId}`);

  // 1. Ensure checkpoint exists
  let checkpoint = await prisma.tjSyncCheckpoint.findUnique({
    where: { executionId_stage: { executionId, stage: 'CITIES' } }
  });

  if (!checkpoint) {
    checkpoint = await prisma.tjSyncCheckpoint.create({
      data: { executionId, stage: 'CITIES' }
    });
  }

  let hasMore = true;
  let cursor: string | undefined = checkpoint.cursor || undefined;
  let totalProcessed = checkpoint.processedCount;

  try {
    // 2. Loop through cursor pagination
    while (hasMore) {
      // Check if sync was paused/stopped by admin
      const executionState = await prisma.tjSyncExecution.findUnique({ where: { executionId } });
      if (!executionState || executionState.status !== 'RUNNING') {
        console.log(`[TripJack Worker] Execution ${executionId} is no longer running (Status: ${executionState?.status}). Pausing worker.`);
        return; // Exit smoothly, BullMQ marks job as completed, but state is paused.
      }

      console.log(`[TripJack Worker] Fetching Cities batch... Cursor: ${cursor || 'Initial'}`);
      
      const result = await batchService.processCitiesBatch(cursor);
      
      hasMore = result.hasMore;
      cursor = result.nextCursor;
      totalProcessed += result.count;

      // 3. Update Checkpoint per page to guarantee exact resume!
      checkpoint = await prisma.tjSyncCheckpoint.update({
        where: { id: checkpoint.id },
        data: { 
          cursor: cursor || null,
          processedCount: totalProcessed 
        }
      });

      // Update total progress on execution
      await prisma.tjSyncExecution.update({
        where: { executionId },
        data: { 
          processedCities: totalProcessed,
          progress: 10.0 + (totalProcessed / 10000) * 10 // Mock progress calculation
        }
      });

      // Rate limit backoff (respecting 3rd party API)
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`[TripJack Worker] Finished Cities Sync. Total: ${totalProcessed}. Transitioning to MAPPINGS.`);

    // 4. Advance to Phase 4: Mappings
    await prisma.tjSyncExecution.update({
      where: { executionId },
      data: { currentStage: 'MAPPINGS' }
    });
    
    await TripJackQueues.mappings.add('sync-mappings', { executionId });

  } catch (error: any) {
    console.error(`[TripJack Worker] Cities Sync Failed at cursor ${cursor}:`, error.message);
    
    await prisma.tjSyncExecution.update({
      where: { executionId },
      data: { status: 'FAILED', errorDetails: error.message }
    });
    
    throw error;
  }
}

