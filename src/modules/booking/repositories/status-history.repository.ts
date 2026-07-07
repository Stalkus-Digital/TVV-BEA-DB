import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { BookingStatusHistory } from "../types/booking-status-history";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface StatusHistoryRepository extends BaseRepository<BookingStatusHistory, string> {
  findByBooking(bookingId: string): Promise<Result<BookingStatusHistory[], AppError>>;
}

export class PrismaStatusHistoryRepository extends PrismaStore<any> implements StatusHistoryRepository {
  constructor() {
    super(prisma.bookingStatusHistory);
  }

  async findByBooking(bookingId: string): Promise<Result<BookingStatusHistory[], AppError>> {
    return ok(
      (await this.delegate.findMany())
        .filter(( h: any ) => h.bookingId === bookingId)
        .sort(( a: any, b: any ) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime())
    );
  }
}
