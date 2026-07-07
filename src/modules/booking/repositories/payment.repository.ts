import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { BookingPayment } from "../types/booking-payment";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface PaymentRepository extends BaseRepository<BookingPayment, string> {
  findByBooking(bookingId: string): Promise<Result<BookingPayment[], AppError>>;
}

export class PrismaPaymentRepository extends PrismaStore<any> implements PaymentRepository {
  constructor() {
    super(prisma.bookingPayment);
  }

  async findByBooking(bookingId: string): Promise<Result<BookingPayment[], AppError>> {
    return ok((await this.delegate.findMany()).filter(( p: any ) => p.bookingId === bookingId));
  }
}
