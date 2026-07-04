import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { BookingTimelineEntry as PrismaRow } from "@/generated/prisma/client";
import type { BookingTimelineEntry } from "../types/booking-timeline";
import type { TimelineRepository } from "./timeline.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaRow): BookingTimelineEntry {
  return { ...row, event: row.event as BookingTimelineEntry["event"], occurredAt: row.occurredAt.toISOString() };
}

export class PrismaTimelineRepository implements TimelineRepository {
  async findById(id: string): Promise<Result<BookingTimelineEntry | null, AppError>> {
    const row = await prisma.bookingTimelineEntry.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByBooking(bookingId: string): Promise<Result<BookingTimelineEntry[], AppError>> {
    const rows = await prisma.bookingTimelineEntry.findMany({ where: { bookingId }, orderBy: { occurredAt: "asc" } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<BookingTimelineEntry>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.bookingTimelineEntry.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.bookingTimelineEntry.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<BookingTimelineEntry, "id">): Promise<Result<BookingTimelineEntry, AppError>> {
    const row = await prisma.bookingTimelineEntry.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<BookingTimelineEntry, "id">>): Promise<Result<BookingTimelineEntry, AppError>> {
    try {
      const row = await prisma.bookingTimelineEntry.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Booking timeline entry "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.bookingTimelineEntry.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Booking timeline entry "${id}" not found`));
    }
  }
}
