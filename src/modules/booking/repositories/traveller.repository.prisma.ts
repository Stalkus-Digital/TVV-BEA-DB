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
function toDomain(row: PrismaTravellerRow & { profile?: any }): Traveller {
  return {
    ...row,
    type: row.type as Traveller["type"],
    gender: row.profile?.gender as Traveller["gender"],
    dateOfBirth: row.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    passportExpiry: row.profile?.passportExpiry?.toISOString().slice(0, 10) ?? null,
    emergencyContact: row.profile?.emergencyContact as unknown as Traveller["emergencyContact"],
    email: row.profile?.email ?? null,
    phone: row.profile?.phone ?? null,
    nationality: row.profile?.nationality ?? null,
    visaRequired: row.profile?.visaRequired ?? false,
    createdAt: row.createdAt.toISOString(),
    updatedAt: (row as any).updatedAt ? (row as any).updatedAt.toISOString() : row.createdAt.toISOString(),
  };
}

export class PrismaTravellerRepository implements TravellerRepository {
  async findById(id: string): Promise<Result<Traveller | null, AppError>> {
    const row = await prisma.traveller.findUnique({ where: { id }, include: { profile: true } });
    return ok(row ? toDomain(row) : null);
  }

  async findByBooking(bookingId: string): Promise<Result<Traveller[], AppError>> {
    const rows = await prisma.traveller.findMany({ where: { bookingId }, include: { profile: true } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Traveller>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [_, rows, total] = await Promise.all([
      prisma.traveller.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.traveller.findMany({ skip: (page - 1) * pageSize, take: pageSize, include: { profile: true } }),
      prisma.traveller.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<Traveller, "id">): Promise<Result<Traveller, AppError>> {
    const row = await prisma.traveller.create({
      data: {
        id: (data as any).id,
        bookingId: data.bookingId,
        type: data.type,
        isLeadTraveller: data.isLeadTraveller,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        passportNumber: data.passportNumber,
        profile: {
          create: {
            firstName: data.fullName.split(" ")[0],
            lastName: data.fullName.split(" ")[1] ?? "",
            email: data.email,
            phone: data.phone,
            nationality: data.nationality,
            passportExpiry: data.passportExpiry ? new Date(data.passportExpiry) : null,
          }
        }
      } as any,
      include: { profile: true }
    });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<Traveller, "id">>): Promise<Result<Traveller, AppError>> {
    try {
      const row = await prisma.traveller.update({
        where: { id },
        data: {
          type: data.type,
          isLeadTraveller: data.isLeadTraveller,
          fullName: data.fullName,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          passportNumber: data.passportNumber,
          profile: {
            update: {
              email: data.email,
              phone: data.phone,
              nationality: data.nationality,
              passportExpiry: data.passportExpiry ? new Date(data.passportExpiry) : undefined,
            }
          }
        },
        include: { profile: true }
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
