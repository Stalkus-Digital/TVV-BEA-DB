import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { BookingItem as PrismaBookingItemRow } from "@/generated/prisma/client";
import type { BookingItem } from "../types/booking-item";
import type { BookingItemRepository } from "./booking-item.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaBookingItemRow): BookingItem {
  return {
    ...row,
    kind: row.kind as BookingItem["kind"],
    supplierBookingReference: row.supplierBookingReference as unknown as BookingItem["supplierBookingReference"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PrismaBookingItemRepository implements BookingItemRepository {
  async findById(id: string): Promise<Result<BookingItem | null, AppError>> {
    const row = await prisma.bookingItem.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByBooking(bookingId: string): Promise<Result<BookingItem[], AppError>> {
    const rows = await prisma.bookingItem.findMany({ where: { bookingId } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<BookingItem>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.bookingItem.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.bookingItem.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<BookingItem, "id">): Promise<Result<BookingItem, AppError>> {
    const row = await prisma.bookingItem.create({
      data: { ...data, supplierBookingReference: data.supplierBookingReference !== null ? (data.supplierBookingReference as object) : undefined },
    });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<BookingItem, "id">>): Promise<Result<BookingItem, AppError>> {
    try {
      const row = await prisma.bookingItem.update({
        where: { id },
        data: { ...data, supplierBookingReference: data.supplierBookingReference !== undefined ? (data.supplierBookingReference as object) : undefined },
      });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Booking item "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.bookingItem.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Booking item "${id}" not found`));
    }
  }
}
