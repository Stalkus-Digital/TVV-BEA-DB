import type { Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import type { BookingStatus } from "../types/booking-status";
import type { BookingStatusHistory } from "../types/booking-status-history";
import type { StatusHistoryRepository } from "../repositories/status-history.repository";

/** Internal bookkeeping, called by BookingService on every transition — not driven by its own API validation, since the transition itself is already validated by the status machine before this records it. */
export class BookingStatusHistoryService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly history: StatusHistoryRepository
  ) {
    super(context);
  }

  async listByBooking(bookingId: string): Promise<Result<BookingStatusHistory[], AppError>> {
    return this.history.findByBooking(bookingId);
  }

  async record(bookingId: string, fromStatus: BookingStatus | null, toStatus: BookingStatus, note: string | null = null): Promise<Result<BookingStatusHistory, AppError>> {
    return this.history.create({ bookingId, fromStatus, toStatus, changedAt: new Date().toISOString(), note });
  }
}
