import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { BookingNote as PrismaRow } from "@/generated/prisma/client";
import type { BookingNote } from "../types/booking-note";
import type { NoteRepository } from "./note.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaRow): BookingNote {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

export class PrismaNoteRepository implements NoteRepository {
  async findById(id: string): Promise<Result<BookingNote | null, AppError>> {
    const row = await prisma.bookingNote.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByBooking(bookingId: string): Promise<Result<BookingNote[], AppError>> {
    const rows = await prisma.bookingNote.findMany({ where: { bookingId }, orderBy: { createdAt: "desc" } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<BookingNote>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.bookingNote.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.bookingNote.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<BookingNote, "id">): Promise<Result<BookingNote, AppError>> {
    const row = await prisma.bookingNote.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<BookingNote, "id">>): Promise<Result<BookingNote, AppError>> {
    try {
      const row = await prisma.bookingNote.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Booking note "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.bookingNote.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Booking note "${id}" not found`));
    }
  }
}
