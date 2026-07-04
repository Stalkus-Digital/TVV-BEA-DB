import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { BookingPayment } from "../types/booking-payment";
import { InMemoryStore } from "./in-memory-store";

export interface PaymentRepository extends BaseRepository<BookingPayment, string> {
  findByBooking(bookingId: string): Promise<Result<BookingPayment[], AppError>>;
}

export class InMemoryPaymentRepository implements PaymentRepository {
  private readonly store = new InMemoryStore<BookingPayment>("Booking payment");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<BookingPayment, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<BookingPayment, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByBooking(bookingId: string): Promise<Result<BookingPayment[], AppError>> {
    return ok(this.store.all().filter((p) => p.bookingId === bookingId));
  }
}
