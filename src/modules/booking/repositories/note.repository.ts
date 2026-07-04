import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { BookingNote } from "../types/booking-note";
import { InMemoryStore } from "./in-memory-store";

export interface NoteRepository extends BaseRepository<BookingNote, string> {
  findByBooking(bookingId: string): Promise<Result<BookingNote[], AppError>>;
}

export class InMemoryNoteRepository implements NoteRepository {
  private readonly store = new InMemoryStore<BookingNote>("Booking note");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<BookingNote, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<BookingNote, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByBooking(bookingId: string): Promise<Result<BookingNote[], AppError>> {
    return ok(
      this.store
        .all()
        .filter((n) => n.bookingId === bookingId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  }
}
