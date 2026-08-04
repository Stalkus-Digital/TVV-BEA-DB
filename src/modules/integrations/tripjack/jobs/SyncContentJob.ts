import { Job } from 'bullmq';
import { TripJackBatchService } from '../services/TripJackBatchService';
import { prisma } from '@/shared/database/prisma-client';

const batchService = new TripJackBatchService();

export async function SyncContentJob(job: Job): Promise<void> {
  const { executionId } = job.data;
  if (!executionId) throw new Error('Missing executionId in job payload.');

  console.log(`[TripJack Worker] Processing Content Sync for execution: ${executionId}`);

  // 1. Ensure checkpoint exists
  let checkpoint = await prisma.tjSyncCheckpoint.findUnique({
    where: { executionId_stage: { executionId, stage: 'CONTENT' } }
  });

  if (!checkpoint) {
    checkpoint = await prisma.tjSyncCheckpoint.create({
      data: { executionId, stage: 'CONTENT', page: 0 } // Page acts as batch index
    });
  }

  let currentPage = checkpoint.page;
  const batchSize = 100; // Strict TripJack constraint
  let totalProcessed = checkpoint.processedCount;
  let hasMore = true;

  try {
    // 2. Loop through locally mapped hotels 100 at a time
    while (hasMore) {
      const executionState = await prisma.tjSyncExecution.findUnique({ where: { executionId } });
      if (!executionState || executionState.status !== 'RUNNING') {
        console.log(`[TripJack Worker] Execution paused. Exiting worker safely.`);
        return;
      }

      console.log(`[TripJack Worker] Fetching locally mapped Hotel IDs (Batch ${currentPage})...`);
      
      const mappedHotels = await prisma.tjHotelMapping.findMany({
        skip: currentPage * batchSize,
        take: batchSize,
        select: { tjHotelId: true }
      });

      if (mappedHotels.length === 0) {
        hasMore = false;
        break; // We've exhausted the local mapping table
      }

      const hotelIds = mappedHotels.map((h: any) => h.tjHotelId);
      
      // 3. Process Content Batch via API
      const result = await batchService.processHotelContentBatch(hotelIds);
      totalProcessed += result.count;

      // 4. Update Checkpoint
      checkpoint = await prisma.tjSyncCheckpoint.update({
        where: { id: checkpoint.id },
        data: { 
          page: currentPage + 1,
          processedCount: totalProcessed 
        }
      });

      // Update total progress
      await prisma.tjSyncExecution.update({
        where: { executionId },
        data: { 
          processedHotels: totalProcessed,
          progress: Math.min(99.9, 60.0 + (currentPage / 3000) * 40) // Assuming max 300,000 hotels (3000 batches)
        }
      });

      currentPage++;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit 1 sec between content pulls
    }

    console.log(`[TripJack Worker] Finished Final Content Sync! Total Hotels: ${totalProcessed}. Sync COMPLETE.`);

    // 5. Finalize execution status
    await prisma.tjSyncExecution.update({
      where: { executionId },
      data: { 
        status: 'COMPLETED',
        progress: 100.0,
        completedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error(`[TripJack Worker] Content Sync Failed at batch ${currentPage}:`, error.message);
    
    await prisma.tjSyncExecution.update({
      where: { executionId },
      data: { status: 'FAILED', errorDetails: error.message }
    });
    
    throw error;
  }
}
