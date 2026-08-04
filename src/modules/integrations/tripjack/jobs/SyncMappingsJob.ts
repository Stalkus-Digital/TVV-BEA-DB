import { Job } from 'bullmq';
import { TripJackDbService } from '../services/TripJackDbService';
import { prisma } from '@/shared/database/prisma-client';
import { TripJackBatchService } from '../services/TripJackBatchService';
import { TripJackQueues } from '../queue';

const batchService = new TripJackBatchService();
const dbService = new TripJackDbService();

export async function SyncMappingsJob(job: Job): Promise<void> {
  const { executionId } = job.data;
  if (!executionId) throw new Error('Missing executionId in job payload.');

  console.log(`[TripJack Worker] Processing Mappings Sync for execution: ${executionId}`);

  // 1. Ensure checkpoint exists
  let checkpoint = await prisma.tjSyncCheckpoint.findUnique({
    where: { executionId_stage: { executionId, stage: 'MAPPINGS' } }
  });

  if (!checkpoint) {
    checkpoint = await prisma.tjSyncCheckpoint.create({
      data: { executionId, stage: 'MAPPINGS', page: 0 }
    });
  }

  try {
    // 2. Fetch all countries to iterate through
    const countries = await prisma.tjCountry.findMany({
      orderBy: { name: 'asc' }
    });

    if (countries.length === 0) {
      console.warn(`[TripJack Worker] No countries found to map. Transitioning directly to CONTENT.`);
      await advanceToNextStage(executionId);
      return;
    }

    // Determine starting index from checkpoint
    // We use checkpoint.cursor to store the current country name, and checkpoint.page for the API page.
    let startingCountryIndex = 0;
    if (checkpoint.cursor) {
      const idx = countries.findIndex(c => c.name === checkpoint?.cursor);
      if (idx !== -1) startingCountryIndex = idx;
    }

    let totalProcessed = checkpoint.processedCount;

    // 3. Iterate through Countries
    for (let i = startingCountryIndex; i < countries.length; i++) {
      const country = countries[i];
      let page: number = i === startingCountryIndex ? checkpoint.page : 0;
      let totalPages = page + 1; // Arbitrary start, updated by response

      console.log(`[TripJack Worker] Syncing Mappings for country: ${country.name}`);

      // 4. Paginating through Country's Mapping API
      while (page < totalPages) {
        // Check Admin Pause
        const executionState = await prisma.tjSyncExecution.findUnique({ where: { executionId } });
        if (!executionState || executionState.status !== 'RUNNING') {
          console.log(`[TripJack Worker] Execution paused. Exiting worker safely.`);
          return;
        }

        const result = await batchService.processHotelMappingBatch(country.name, page);
        totalProcessed += result.count;
        totalPages = result.totalPages;

        // Save Exact Checkpoint per page
        checkpoint = await prisma.tjSyncCheckpoint.update({
          where: { id: checkpoint.id },
          data: {
            cursor: country.name,
            page: page + 1 < totalPages ? page + 1 : 0, // Reset page for next country if done
            processedCount: totalProcessed
          }
        });

        // Update Execution total
        await prisma.tjSyncExecution.update({
          where: { executionId },
          data: {
            processedHotels: totalProcessed,
            progress: Math.min(60.0, 20.0 + ((i / countries.length) * 40)) // Scale 20% to 60%
          }
        });

        page++;
        await new Promise(resolve => setTimeout(resolve, 500)); // Respect API limits
      }
    }

    console.log(`[TripJack Worker] Finished Mapping Sync. Total ID Mappings: ${totalProcessed}. Transitioning to CONTENT.`);
    await advanceToNextStage(executionId);

  } catch (error: any) {
    console.error(`[TripJack Worker] Mappings Sync Failed:`, error.message);
    
    await prisma.tjSyncExecution.update({
      where: { executionId },
      data: { status: 'FAILED', errorDetails: error.message }
    });
    
    throw error;
  }
}

async function advanceToNextStage(executionId: string) {
  await prisma.tjSyncExecution.update({
    where: { executionId },
    data: { currentStage: 'CONTENT' }
  });
  await TripJackQueues.content.add('sync-content', { executionId });
}
