import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Traveller as PrismaTravellerRow } from "@/generated/prisma/client";
import type { Traveller } from "../types/traveller";
import type { TravellerRepository } from "./traveller.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

/**
 * dateOfBirth/passportExpiry are truncated to date-only (YYYY-MM-DD) here,
 * not full ISO — TravellerService.add()'s duplicate check compares
 * `t.dateOfBirth === value.dateOfBirth` by strict string equality against
 * the caller's raw, never-round-tripped input, which is always a date-only
 * string in practice (see traveller.validation.ts). The old in-memory
 * repository stored values verbatim with no serialization step at all, so
 * a real Date column's `.toISOString()` (which adds a time/zone component)
 * silently broke that equality check — caught by
 * tests/unit/booking/booking-lifecycle.test.ts's duplicate-prevention test.
 * Truncating on read restores the exact round-trip fidelity the in-memory
 * store gave for free.
 */
function toDomain(row: PrismaTravellerRow): Traveller {
  return {
    ...row,
    type: row.type as Traveller["type"],
    gender: row.gender as Traveller["gender"],
    dateOfBirth: row.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    passportExpiry: row.passportExpiry?.toISOString().slice(0, 10) ?? null,
    emergencyContact: row.emergencyContact as unknown as Traveller["emergencyContact"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PrismaTravellerRepository implements TravellerRepository {
  async findById(id: string): Promise<Result<Traveller | null, AppError>> {
    const row = await prisma.traveller.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByBooking(bookingId: string): Promise<Result<Traveller[], AppError>> {
    const rows = await prisma.traveller.findMany({ where: { bookingId } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Traveller>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.traveller.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.traveller.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<Traveller, "id">): Promise<Result<Traveller, AppError>> {
    const row = await prisma.traveller.create({
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        passportExpiry: data.passportExpiry ? new Date(data.passportExpiry) : null,
        emergencyContact: data.emergencyContact !== null ? (data.emergencyContact as object) : undefined,
      },
    });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<Traveller, "id">>): Promise<Result<Traveller, AppError>> {
    try {
      const row = await prisma.traveller.update({
        where: { id },
        data: {
          ...data,
          dateOfBirth: data.dateOfBirth !== undefined ? (data.dateOfBirth ? new Date(data.dateOfBirth) : null) : undefined,
          passportExpiry: data.passportExpiry !== undefined ? (data.passportExpiry ? new Date(data.passportExpiry) : null) : undefined,
          emergencyContact: data.emergencyContact !== undefined ? (data.emergencyContact as object) : undefined,
        },
      });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Traveller "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.traveller.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Traveller "${id}" not found`));
    }
  }
}
