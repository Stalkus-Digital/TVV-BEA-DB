import { BaseService, type ServiceContext } from "@/shared/services";
import { prisma } from "@/shared/database/prisma-client";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";
import { SembarkClient } from "../../supplier/adapters/sembark/sembark.client";

export class JobQueueService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async enqueue(type: string, payload: any): Promise<Result<string, AppError>> {
    try {
      const job = await prisma.backgroundJob.create({
        data: {
          type,
          payload,
          status: "PENDING",
        },
      });
      return ok(job.id);
    } catch (error: any) {
      this.logger.error("Failed to enqueue job", { type, error: error.message });
      return err(new InternalError("Failed to enqueue job"));
    }
  }

  async processNext(): Promise<Result<number, AppError>> {
    let processed = 0;
    try {
      // Find up to 10 pending jobs
      const jobs = await prisma.backgroundJob.findMany({
        where: {
          status: "PENDING",
          nextRetryAt: { lte: new Date() },
        },
        take: 10,
        orderBy: { createdAt: "asc" },
      });

      if (jobs.length === 0) return ok(0);

      const sembarkClient = new SembarkClient({ logger: this.logger });

      for (const job of jobs) {
        // Lock the job to prevent concurrent processing
        await prisma.$transaction(async (tx) => {
          const lockedJob = await tx.$queryRaw<{ id: string, type: string, payload: any, attempts: number, maxAttempts: number }[]>`
            SELECT id, type, payload, attempts, "maxAttempts"
            FROM "background_jobs"
            WHERE id = ${job.id} AND status = 'PENDING'
            FOR UPDATE SKIP LOCKED
          `;

          if (lockedJob.length === 0) return; // Already picked up by another worker

          const currentJob = lockedJob[0];
          
          try {
            await tx.backgroundJob.update({
              where: { id: currentJob.id },
              data: { status: "PROCESSING", attempts: { increment: 1 } },
            });

            // Execute based on type
            if (currentJob.type === "SEMBARK_SYNC_CUSTOMER") {
              const customer = await tx.customerProfile.findUnique({ where: { id: currentJob.payload.customerId } });
              if (customer) await sembarkClient.syncCustomer(customer);
            } else if (currentJob.type === "SEMBARK_SYNC_BOOKING") {
              const booking = await tx.booking.findUnique({ where: { id: currentJob.payload.bookingId } });
              if (booking) await sembarkClient.syncBooking(booking);
            } else if (currentJob.type === "SEMBARK_SYNC_BOOKING_STATUS") {
              await sembarkClient.syncBookingStatus(currentJob.payload.bookingId, currentJob.payload.status);
            } else if (currentJob.type === "SEMBARK_SYNC_PAYMENT") {
              const payment = await tx.bookingPayment.findUnique({ where: { id: currentJob.payload.paymentId } });
              if (payment) await sembarkClient.syncPayment(currentJob.payload.bookingId, payment);
            }

            // Mark completed
            await tx.backgroundJob.update({
              where: { id: currentJob.id },
              data: { status: "COMPLETED" },
            });
            processed++;

          } catch (e: any) {
            const nextAttempts = currentJob.attempts + 1;
            const status = nextAttempts >= currentJob.maxAttempts ? "FAILED" : "PENDING";
            // Exponential backoff
            const nextRetryAt = new Date(Date.now() + Math.pow(2, nextAttempts) * 60000);

            await tx.backgroundJob.update({
              where: { id: currentJob.id },
              data: { 
                status, 
                error: e.message,
                nextRetryAt,
                attempts: nextAttempts
              },
            });
          }
        });
      }

      return ok(processed);
    } catch (error: any) {
      this.logger.error("Failed to process job queue", { error: error.message });
      return err(new InternalError("Failed to process job queue"));
    }
  }
}
