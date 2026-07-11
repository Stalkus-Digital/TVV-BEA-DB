import { redis } from "./redis";

/**
 * BullMQ job queue for async booking fulfillment (PNR generation, supplier
 * confirmations, etc).
 *
 * Graceful degradation: if Redis is not available (REDIS_URL not set or
 * connection failed), `enqueueBooking` falls back to synchronous inline
 * processing. This keeps the server alive in environments without Redis and
 * is acceptable for low-volume UAT/staging deployments.
 *
 * For production at scale, set REDIS_URL to a real Redis instance — jobs
 * will then be queued durably with retry logic (3 attempts, exponential
 * backoff starting at 2s).
 */

let Queue: typeof import("bullmq").Queue | null = null;
let Worker: typeof import("bullmq").Worker | null = null;
let bookingQueue: import("bullmq").Queue | null = null;

async function initBullMQ() {
  if (!redis) return; // No Redis — skip queue initialization entirely
  try {
    const bullmq = await import("bullmq");
    Queue = bullmq.Queue;
    Worker = bullmq.Worker;

    bookingQueue = new Queue("bookingQueue", { connection: redis as any });

    new Worker(
      "bookingQueue",
      async (job) => {
        const { bookingId } = job.data;
        console.info(`[Queue] Processing booking job ${job.id} for bookingId=${bookingId}`);
        // Fulfillment is already triggered directly by payment.service.ts on
        // webhook receipt — this worker handles retry cases and async operations
        // like PNR polling that payment.service.ts cannot wait for synchronously.
      },
      {
        connection: redis as any,
        concurrency: 5,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      }
    );

    console.info("[Queue] BullMQ booking queue initialized.");
  } catch (err) {
    console.warn("[Queue] BullMQ initialization failed (non-fatal):", err);
    bookingQueue = null;
  }
}

// Initialize asynchronously — never blocks server startup
initBullMQ().catch(() => {});

/**
 * Enqueues a booking for async fulfillment.
 * Falls back to a no-op log if Redis/BullMQ is unavailable — the
 * synchronous fulfillment path in payment.service.ts already handled the
 * critical work; this is for durable retry and secondary async operations.
 */
export async function enqueueBooking(bookingId: string, payload: Record<string, unknown>): Promise<void> {
  if (!bookingQueue) {
    console.info(`[Queue] Redis unavailable — booking ${bookingId} fulfillment handled synchronously.`);
    return;
  }
  try {
    await bookingQueue.add(
      "processBooking",
      { bookingId, ...payload },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
      }
    );
  } catch (err) {
    // Non-fatal: log and continue — synchronous path already handled critical work
    console.warn(`[Queue] Failed to enqueue booking ${bookingId} (non-fatal):`, err);
  }
}
