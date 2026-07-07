import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { BookingVoucher } from "../types/booking-voucher";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface VoucherRepository extends BaseRepository<BookingVoucher, string> {
  findByBooking(bookingId: string): Promise<Result<BookingVoucher[], AppError>>;
  countAll(): Promise<Result<number, AppError>>;
}

export class PrismaVoucherRepository extends PrismaStore<any> implements VoucherRepository {
  constructor() {
    super(prisma.bookingVoucher);
  }

  async findByBooking(bookingId: string): Promise<Result<BookingVoucher[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( v: any ) => v.bookingId === bookingId));
  }

  async countAll(): Promise<Result<number, AppError>> {
    return ok((await this.delegate.count()));
  }
}
