import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { BookingTimelineEntry } from "../types/booking-timeline";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface TimelineRepository extends BaseRepository<BookingTimelineEntry, string> {
  findByBooking(bookingId: string): Promise<Result<BookingTimelineEntry[], AppError>>;
}

export class PrismaTimelineRepository extends PrismaStore<any> implements TimelineRepository {
  constructor() {
    super(prisma.bookingTimelineEntry);
  }

  async findByBooking(bookingId: string): Promise<Result<BookingTimelineEntry[], AppError>> {
    return ok(
      (await this.delegate.findMany())
        .filter(( e: any ) => e.bookingId === bookingId)
        .sort(( a: any, b: any ) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime())
    );
  }
}
