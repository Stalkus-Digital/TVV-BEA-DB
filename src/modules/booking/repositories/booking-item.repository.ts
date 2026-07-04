import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { BookingItem } from "../types/booking-item";
import { InMemoryStore } from "./in-memory-store";

export interface BookingItemRepository extends BaseRepository<BookingItem, string> {
  findByBooking(bookingId: string): Promise<Result<BookingItem[], AppError>>;
}

export class InMemoryBookingItemRepository implements BookingItemRepository {
  private readonly store = new InMemoryStore<BookingItem>("Booking item");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<BookingItem, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<BookingItem, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByBooking(bookingId: string): Promise<Result<BookingItem[], AppError>> {
    return ok(this.store.all().filter((item) => item.bookingId === bookingId));
  }
}
