import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { BookingNote } from "../types/booking-note";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface NoteRepository extends BaseRepository<BookingNote, string> {
  findByBooking(bookingId: string): Promise<Result<BookingNote[], AppError>>;
}

export class PrismaNoteRepository extends PrismaStore<any> implements NoteRepository {
  constructor() {
    super(prisma.bookingNote);
  }

  async findByBooking(bookingId: string): Promise<Result<BookingNote[], AppError>> {
    return ok(
      (await this.delegate.findMany())
        .filter(( n: any ) => n.bookingId === bookingId)
        .sort(( a: any, b: any ) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  }
}
