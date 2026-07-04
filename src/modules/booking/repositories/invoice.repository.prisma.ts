import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { BookingInvoice as PrismaBookingInvoiceRow } from "@/generated/prisma/client";
import type { BookingInvoice } from "../types/booking-invoice";
import type { InvoiceRepository } from "./invoice.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaBookingInvoiceRow): BookingInvoice {
  return {
    ...row,
    billTo: row.billTo as unknown as BookingInvoice["billTo"],
    lineItems: row.lineItems as unknown as BookingInvoice["lineItems"],
    issuedAt: row.issuedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export class PrismaInvoiceRepository implements InvoiceRepository {
  async findById(id: string): Promise<Result<BookingInvoice | null, AppError>> {
    const row = await prisma.bookingInvoice.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByBooking(bookingId: string): Promise<Result<BookingInvoice[], AppError>> {
    const rows = await prisma.bookingInvoice.findMany({ where: { bookingId } });
    return ok(rows.map(toDomain));
  }

  async countAll(): Promise<Result<number, AppError>> {
    return ok(await prisma.bookingInvoice.count());
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<BookingInvoice>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.bookingInvoice.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.bookingInvoice.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<BookingInvoice, "id">): Promise<Result<BookingInvoice, AppError>> {
    const row = await prisma.bookingInvoice.create({
      data: { ...data, billTo: data.billTo as object, lineItems: data.lineItems as unknown as object },
    });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<BookingInvoice, "id">>): Promise<Result<BookingInvoice, AppError>> {
    try {
      const row = await prisma.bookingInvoice.update({
        where: { id },
        data: { ...data, billTo: data.billTo !== undefined ? (data.billTo as object) : undefined, lineItems: data.lineItems !== undefined ? (data.lineItems as unknown as object) : undefined },
      });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Booking invoice "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.bookingInvoice.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Booking invoice "${id}" not found`));
    }
  }
}
