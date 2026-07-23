import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";
import { getJobQueueService } from "../../system";

export class SembarkSyncService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async syncCustomer(customerId: string): Promise<Result<void, AppError>> {
    try {
      const queue = getJobQueueService();
      await queue.enqueue("SEMBARK_SYNC_CUSTOMER", { customerId });
      this.logger.info("Enqueued Customer sync to Sembark", { customerId });
      return ok(undefined);
    } catch (error: any) {
      this.logger.error("Failed to enqueue customer sync to Sembark", { error: error.message });
      return err(new InternalError("Failed to enqueue customer sync to Sembark"));
    }
  }

  async syncBooking(bookingId: string): Promise<Result<void, AppError>> {
    try {
      const queue = getJobQueueService();
      await queue.enqueue("SEMBARK_SYNC_BOOKING", { bookingId });
      this.logger.info("Enqueued Booking sync to Sembark", { bookingId });
      return ok(undefined);
    } catch (error: any) {
      this.logger.error("Failed to enqueue booking sync to Sembark", { error: error.message });
      return err(new InternalError("Failed to enqueue booking sync to Sembark"));
    }
  }

  async syncBookingStatus(bookingId: string, status: string): Promise<Result<void, AppError>> {
    try {
      const queue = getJobQueueService();
      await queue.enqueue("SEMBARK_SYNC_BOOKING_STATUS", { bookingId, status });
      this.logger.info("Enqueued Booking Status sync to Sembark", { bookingId, status });
      return ok(undefined);
    } catch (error: any) {
      this.logger.error("Failed to enqueue booking status sync to Sembark", { error: error.message });
      return err(new InternalError("Failed to enqueue booking status sync to Sembark"));
    }
  }

  async syncPayment(bookingId: string, paymentId: string): Promise<Result<void, AppError>> {
    try {
      const queue = getJobQueueService();
      await queue.enqueue("SEMBARK_SYNC_PAYMENT", { bookingId, paymentId });
      this.logger.info("Enqueued Payment sync to Sembark", { bookingId, paymentId });
      return ok(undefined);
    } catch (error: any) {
      this.logger.error("Failed to enqueue payment sync to Sembark", { error: error.message });
      return err(new InternalError("Failed to enqueue payment sync to Sembark"));
    }
  }
}
