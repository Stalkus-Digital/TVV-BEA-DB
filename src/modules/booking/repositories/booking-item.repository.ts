import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { BookingItem } from "../types/booking-item";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface BookingItemRepository extends BaseRepository<BookingItem, string> {
  findByBooking(bookingId: string): Promise<Result<BookingItem[], AppError>>;
}

export class PrismaBookingItemRepository extends PrismaStore<any> implements BookingItemRepository {
  constructor() {
    super(prisma.bookingItem);
  }

  async findByBooking(bookingId: string): Promise<Result<BookingItem[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( item: any ) => item.bookingId === bookingId));
  }
}
