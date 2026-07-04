import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { BookingTimelineEntry } from "../types/booking-timeline";
import { InMemoryStore } from "./in-memory-store";

export interface TimelineRepository extends BaseRepository<BookingTimelineEntry, string> {
  findByBooking(bookingId: string): Promise<Result<BookingTimelineEntry[], AppError>>;
}

export class InMemoryTimelineRepository implements TimelineRepository {
  private readonly store = new InMemoryStore<BookingTimelineEntry>("Booking timeline entry");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<BookingTimelineEntry, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<BookingTimelineEntry, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByBooking(bookingId: string): Promise<Result<BookingTimelineEntry[], AppError>> {
    return ok(
      this.store
        .all()
        .filter((e) => e.bookingId === bookingId)
        .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime())
    );
  }
}
