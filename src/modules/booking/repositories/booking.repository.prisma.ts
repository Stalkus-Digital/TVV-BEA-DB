import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Prisma, Booking as PrismaBookingRow } from "@/generated/prisma/client";
import type { Booking } from "../types/booking";
import type { BookingListFilter, BookingRepository } from "./booking.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: any): Booking {
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

async function buildWhere(filter: BookingListFilter): Promise<Prisma.BookingWhereInput> {
  const where: Prisma.BookingWhereInput = {};
  if (filter.status) where.status = filter.status;
  if (filter.destinationId) where.destinationId = filter.destinationId;
  if (filter.sourceQuoteId) where.sourceQuoteId = filter.sourceQuoteId;
  if (filter.customerId) where.customerId = filter.customerId;
  if (filter.hasItemKind) {
    if (filter.hasItemKind === "HOLIDAY_OR_PACKAGE") {
      const items = await prisma.bookingItem.findMany({ where: { kind: "PACKAGE" }, select: { bookingId: true } });
      const bookingIds = items.map(i => i.bookingId);
      where.OR = [
        { packageId: { not: null } },
        { id: { in: bookingIds } }
      ];
    } else {
      const items = await prisma.bookingItem.findMany({ where: { kind: filter.hasItemKind }, select: { bookingId: true } });
      const bookingIds = items.map(i => i.bookingId);
      where.id = { in: bookingIds };
    }
  }
  return where;
}

export class PrismaBookingRepository implements BookingRepository {
  async findById(id: string): Promise<Result<Booking | null, AppError>> {
    const row = await prisma.booking.findUnique({ 
      where: { id }
    });
    if (!row) return ok(null);

    const [items, travellers] = await Promise.all([
      prisma.bookingItem.findMany({ where: { bookingId: id } }),
      prisma.traveller.findMany({ where: { bookingId: id } })
    ]);

    return ok(toDomain({ ...row, items, travellers }));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Booking>, AppError>> {
    return this.findByFilter(params);
  }

  async findByFilter(filter: BookingListFilter): Promise<Result<PaginatedResult<Booking>, AppError>> {
    const page = filter.page ?? DEFAULT_PAGE;
    const pageSize = filter.pageSize ?? DEFAULT_PAGE_SIZE;
    const where = await buildWhere(filter);
    const [rows, total] = await Promise.all([
      prisma.booking.findMany({ 
        where, 
        skip: (page - 1) * pageSize, 
        take: pageSize, 
        orderBy: { createdAt: "desc" }
      }),
      prisma.booking.count({ where }),
    ]);

    const bookingIds = rows.map((r) => r.id);
    const [allItems, allTravellers] = await Promise.all([
      bookingIds.length > 0 ? prisma.bookingItem.findMany({ where: { bookingId: { in: bookingIds } } }) : Promise.resolve([]),
      bookingIds.length > 0 ? prisma.traveller.findMany({ where: { bookingId: { in: bookingIds } } }) : Promise.resolve([])
    ]);

    const itemsByBooking = new Map<string, any[]>();
    const travellersByBooking = new Map<string, any[]>();
    for (const item of allItems) {
      if (!itemsByBooking.has(item.bookingId)) itemsByBooking.set(item.bookingId, []);
      itemsByBooking.get(item.bookingId)!.push(item);
    }
    for (const traveller of allTravellers) {
      if (!travellersByBooking.has(traveller.bookingId)) travellersByBooking.set(traveller.bookingId, []);
      travellersByBooking.get(traveller.bookingId)!.push(traveller);
    }

    const domainRows = rows.map((row) => 
      toDomain({
        ...row,
        items: itemsByBooking.get(row.id) ?? [],
        travellers: travellersByBooking.get(row.id) ?? []
      })
    );

    return ok({ items: domainRows, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
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
