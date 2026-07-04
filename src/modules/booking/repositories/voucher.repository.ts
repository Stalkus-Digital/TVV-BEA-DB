import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { BookingVoucher } from "../types/booking-voucher";
import { InMemoryStore } from "./in-memory-store";

export interface VoucherRepository extends BaseRepository<BookingVoucher, string> {
  findByBooking(bookingId: string): Promise<Result<BookingVoucher[], AppError>>;
  countAll(): Promise<Result<number, AppError>>;
}

export class InMemoryVoucherRepository implements VoucherRepository {
  private readonly store = new InMemoryStore<BookingVoucher>("Booking voucher");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<BookingVoucher, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<BookingVoucher, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByBooking(bookingId: string): Promise<Result<BookingVoucher[], AppError>> {
    return ok(this.store.all().filter((v) => v.bookingId === bookingId));
  }

  async countAll(): Promise<Result<number, AppError>> {
    return ok(this.store.all().length);
  }
}
