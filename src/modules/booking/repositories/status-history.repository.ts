import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { BookingStatusHistory } from "../types/booking-status-history";
import { InMemoryStore } from "./in-memory-store";

export interface StatusHistoryRepository extends BaseRepository<BookingStatusHistory, string> {
  findByBooking(bookingId: string): Promise<Result<BookingStatusHistory[], AppError>>;
}

export class InMemoryStatusHistoryRepository implements StatusHistoryRepository {
  private readonly store = new InMemoryStore<BookingStatusHistory>("Booking status history entry");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<BookingStatusHistory, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<BookingStatusHistory, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByBooking(bookingId: string): Promise<Result<BookingStatusHistory[], AppError>> {
    return ok(
      this.store
        .all()
        .filter((h) => h.bookingId === bookingId)
        .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime())
    );
  }
}
