import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { BookingStatusHistory as PrismaRow } from "@/generated/prisma/client";
import type { BookingStatusHistory } from "../types/booking-status-history";
import type { StatusHistoryRepository } from "./status-history.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaRow): BookingStatusHistory {
  return {
    ...row,
    fromStatus: row.fromStatus as BookingStatusHistory["fromStatus"],
    toStatus: row.toStatus as BookingStatusHistory["toStatus"],
    changedAt: row.changedAt.toISOString(),
  };
}

export class PrismaStatusHistoryRepository implements StatusHistoryRepository {
  async findById(id: string): Promise<Result<BookingStatusHistory | null, AppError>> {
    const row = await prisma.bookingStatusHistory.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByBooking(bookingId: string): Promise<Result<BookingStatusHistory[], AppError>> {
    const rows = await prisma.bookingStatusHistory.findMany({ where: { bookingId }, orderBy: { changedAt: "asc" } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<BookingStatusHistory>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.bookingStatusHistory.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.bookingStatusHistory.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<BookingStatusHistory, "id">): Promise<Result<BookingStatusHistory, AppError>> {
    const row = await prisma.bookingStatusHistory.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<BookingStatusHistory, "id">>): Promise<Result<BookingStatusHistory, AppError>> {
    try {
      const row = await prisma.bookingStatusHistory.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Booking status history entry "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.bookingStatusHistory.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Booking status history entry "${id}" not found`));
    }
  }
}
