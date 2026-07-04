import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { BookingInvoice } from "../types/booking-invoice";
import { InMemoryStore } from "./in-memory-store";

export interface InvoiceRepository extends BaseRepository<BookingInvoice, string> {
  findByBooking(bookingId: string): Promise<Result<BookingInvoice[], AppError>>;
  countAll(): Promise<Result<number, AppError>>;
}

export class InMemoryInvoiceRepository implements InvoiceRepository {
  private readonly store = new InMemoryStore<BookingInvoice>("Booking invoice");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<BookingInvoice, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<BookingInvoice, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByBooking(bookingId: string): Promise<Result<BookingInvoice[], AppError>> {
    return ok(this.store.all().filter((i) => i.bookingId === bookingId));
  }

  async countAll(): Promise<Result<number, AppError>> {
    return ok(this.store.all().length);
  }
}
