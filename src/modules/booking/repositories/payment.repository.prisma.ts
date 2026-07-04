import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { BookingPayment as PrismaBookingPaymentRow } from "@/generated/prisma/client";
import type { BookingPayment } from "../types/booking-payment";
import type { PaymentRepository } from "./payment.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaBookingPaymentRow): BookingPayment {
  return {
    ...row,
    status: row.status as BookingPayment["status"],
    paidAt: row.paidAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export class PrismaPaymentRepository implements PaymentRepository {
  async findById(id: string): Promise<Result<BookingPayment | null, AppError>> {
    const row = await prisma.bookingPayment.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByBooking(bookingId: string): Promise<Result<BookingPayment[], AppError>> {
    const rows = await prisma.bookingPayment.findMany({ where: { bookingId } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<BookingPayment>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.bookingPayment.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.bookingPayment.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<BookingPayment, "id">): Promise<Result<BookingPayment, AppError>> {
    const row = await prisma.bookingPayment.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<BookingPayment, "id">>): Promise<Result<BookingPayment, AppError>> {
    try {
      const row = await prisma.bookingPayment.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Booking payment "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.bookingPayment.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Booking payment "${id}" not found`));
    }
  }
}
