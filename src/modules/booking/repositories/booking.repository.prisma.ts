import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Prisma, Booking as PrismaBookingRow } from "@/generated/prisma/client";
import type { Booking } from "../types/booking";
import type { BookingListFilter, BookingRepository } from "./booking.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaBookingRow): Booking {
  return {
    ...row,
    status: row.status as Booking["status"],
    paymentStatus: row.paymentStatus as Booking["paymentStatus"],
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    ticketedAt: row.ticketedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toWhere(filter: BookingListFilter): Prisma.BookingWhereInput {
  const where: Prisma.BookingWhereInput = {};
  if (filter.status) where.status = filter.status;
  if (filter.destinationId) where.destinationId = filter.destinationId;
  if (filter.sourceQuoteId) where.sourceQuoteId = filter.sourceQuoteId;
  if (filter.customerId) where.customerId = filter.customerId;
  return where;
}

export class PrismaBookingRepository implements BookingRepository {
  async findById(id: string): Promise<Result<Booking | null, AppError>> {
    const row = await prisma.booking.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Booking>, AppError>> {
    return this.findByFilter(params);
  }

  async findByFilter(filter: BookingListFilter): Promise<Result<PaginatedResult<Booking>, AppError>> {
    const page = filter.page ?? DEFAULT_PAGE;
    const pageSize = filter.pageSize ?? DEFAULT_PAGE_SIZE;
    const where = toWhere(filter);
    const [rows, total] = await Promise.all([
      prisma.booking.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
      prisma.booking.count({ where }),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async countAll(): Promise<Result<number, AppError>> {
    return ok(await prisma.booking.count());
  }

  async create(data: Omit<Booking, "id">): Promise<Result<Booking, AppError>> {
    const row = await prisma.booking.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<Booking, "id">>): Promise<Result<Booking, AppError>> {
    try {
      const row = await prisma.booking.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Booking "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.booking.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Booking "${id}" not found`));
    }
  }
}
