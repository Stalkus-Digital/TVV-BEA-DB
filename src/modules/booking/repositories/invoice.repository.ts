import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { BookingInvoice } from "../types/booking-invoice";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface InvoiceRepository extends BaseRepository<BookingInvoice, string> {
  findByBooking(bookingId: string): Promise<Result<BookingInvoice[], AppError>>;
  countAll(): Promise<Result<number, AppError>>;
}

export class PrismaInvoiceRepository extends PrismaStore<any> implements InvoiceRepository {
  constructor() {
    super(prisma.bookingInvoice);
  }

  async findByBooking(bookingId: string): Promise<Result<BookingInvoice[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( i: any ) => i.bookingId === bookingId));
  }

  async countAll(): Promise<Result<number, AppError>> {
    return ok((await this.delegate.count()));
  }
}
