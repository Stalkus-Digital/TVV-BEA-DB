import { Job } from 'bullmq';
import { prisma } from '@/shared/database/prisma-client';
import { TripJackBatchService } from '../services/TripJackBatchService';
import { TripJackQueues } from '../queue';

const batchService = new TripJackBatchService();

export async function SyncCountriesJob(job: Job): Promise<void> {
  const { executionId } = job.data;
  if (!executionId) throw new Error('Missing executionId in job payload.');

  console.log(`[TripJack Worker] Processing Countries Sync for execution: ${executionId}`);

  // 1. Ensure checkpoint exists
  let checkpoint = await prisma.tjSyncCheckpoint.findUnique({
    where: { executionId_stage: { executionId, stage: 'COUNTRIES' } }
  });

  if (!checkpoint) {
    checkpoint = await prisma.tjSyncCheckpoint.create({
      data: { executionId, stage: 'COUNTRIES' }
    });
  }

  try {
    // 2. Process Countries Batch
    const count = await batchService.processCountriesBatch();

    // 3. Update Checkpoint
    await prisma.tjSyncCheckpoint.update({
      where: { id: checkpoint.id },
      data: { processedCount: count, remainingCount: 0 }
    });

    // 4. Update Execution Record
    await prisma.tjSyncExecution.update({
      where: { executionId },
      data: { processedCountries: count, progress: 5.0 } // Arbitrary early progress
    });

    console.log(`[TripJack Worker] Finished Countries Sync. Total: ${count}. Transitioning to CITIES.`);

    // 5. Advance to Phase 3: Cities
    await prisma.tjSyncExecution.update({
      where: { executionId },
      data: { currentStage: 'CITIES' }
    });
    await TripJackQueues.cities.add('sync-cities', { executionId });

  } catch (error: any) {
    console.error(`[TripJack Worker] Countries Sync Failed:`, error.message);
    
    // Pause execution on failure to allow resume
    await prisma.tjSyncExecution.update({
      where: { executionId },
      data: { status: 'FAILED', errorDetails: error.message }
    });
    
    throw error; // BullMQ will retry based on exponential backoff
  }
}

