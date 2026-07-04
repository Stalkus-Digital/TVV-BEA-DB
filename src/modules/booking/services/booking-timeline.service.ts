import type { Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import type { BookingTimelineEntry, BookingTimelineEvent } from "../types/booking-timeline";
import type { TimelineRepository } from "../repositories/timeline.repository";

/** Internal bookkeeping, called by BookingService — see booking-status-history.service.ts for why this isn't independently API-validated. */
export class BookingTimelineService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly timeline: TimelineRepository
  ) {
    super(context);
  }

  async listByBooking(bookingId: string): Promise<Result<BookingTimelineEntry[], AppError>> {
    return this.timeline.findByBooking(bookingId);
  }

  async record(bookingId: string, event: BookingTimelineEvent, occurredAt: string, details: string | null = null): Promise<Result<BookingTimelineEntry, AppError>> {
    return this.timeline.create({ bookingId, event, occurredAt, details });
  }
}
