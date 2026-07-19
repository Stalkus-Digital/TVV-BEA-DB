import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Prisma } from "@/generated/prisma/client";
import type { Booking } from "../types/booking";
import type { BookingListFilter, BookingRepository } from "./booking.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export type BookingCategory = "PACKAGE" | "HOTEL" | "ACTIVITY";

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

/** InventoryItem.kind values that map to a Booking Management tab — BookingItem.kind itself is only ever PACKAGE|INVENTORY|CUSTOM, never "HOTEL"/"ACTIVITY". */
const PRODUCT_INVENTORY_KINDS = ["HOTEL", "ACTIVITY"] as const;

/**
 * Website bookings stash `externalBookingType` in internalNotes JSON when they
 * have no BookingItem rows yet. Normalize to a Booking Management category.
 */
export function parseExternalBookingType(notes: string | null | undefined): BookingCategory | null {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes) as Record<string, unknown>;
    const raw = String(parsed.externalBookingType ?? parsed.bookingType ?? "").toUpperCase();
    if (raw === "HOTEL") return "HOTEL";
    if (raw === "ACTIVITY") return "ACTIVITY";
    if (raw === "PACKAGE" || raw === "HOLIDAY" || raw === "HOLIDAY_OR_PACKAGE") return "PACKAGE";
  } catch {
    // not JSON — ignore
  }
  return null;
}

function categorizeFromSignals(input: {
  packageId: string | null | undefined;
  internalNotes: string | null | undefined;
  itemKinds: Set<string | undefined>;
}): BookingCategory {
  if (input.itemKinds.has("HOTEL")) return "HOTEL";
  if (input.itemKinds.has("ACTIVITY")) return "ACTIVITY";
  if (input.packageId || input.itemKinds.has("PACKAGE")) return "PACKAGE";
  const fromNotes = parseExternalBookingType(input.internalNotes);
  if (fromNotes) return fromNotes;
  // Orphans (no items, no packageId, no notes tag) still appear under Holiday Bookings
  return "PACKAGE";
}

async function bookingIdsForInventoryKind(kind: "HOTEL" | "ACTIVITY"): Promise<string[]> {
  const inventoryItems = await prisma.inventoryItem.findMany({ where: { kind }, select: { id: true } });
  const inventoryIds = inventoryItems.map((i) => i.id);
  if (inventoryIds.length === 0) return [];
  const items = await prisma.bookingItem.findMany({
    where: { kind: "INVENTORY", inventoryItemId: { in: inventoryIds } },
    select: { bookingId: true },
  });
  return [...new Set(items.map((i) => i.bookingId))];
}

async function bookingIdsWithExternalType(category: BookingCategory): Promise<string[]> {
  const needles =
    category === "PACKAGE"
      ? ['"externalBookingType":"PACKAGE"', '"externalBookingType":"HOLIDAY"', '"bookingType":"PACKAGE"', '"bookingType":"HOLIDAY"']
      : [`"externalBookingType":"${category}"`, `"bookingType":"${category}"`];

  const rows = await prisma.booking.findMany({
    where: {
      OR: needles.map((needle) => ({ internalNotes: { contains: needle } })),
    },
    select: { id: true, internalNotes: true, packageId: true },
  });

  // Re-parse to avoid false positives from substring matches
  return rows.filter((row) => parseExternalBookingType(row.internalNotes) === category).map((row) => row.id);
}

async function buildWhere(filter: BookingListFilter): Promise<Prisma.BookingWhereInput> {
  const where: Prisma.BookingWhereInput = {};
  if (filter.status) where.status = filter.status;
  if (filter.destinationId) where.destinationId = filter.destinationId;
  if (filter.sourceQuoteId) where.sourceQuoteId = filter.sourceQuoteId;
  if (filter.customerId) where.customerId = filter.customerId;

  if (!filter.hasItemKind) return where;

  if (filter.hasItemKind === "HOLIDAY_OR_PACKAGE") {
    const [hotelIds, activityIds, noteHotelIds, noteActivityIds, allBookings] = await Promise.all([
      bookingIdsForInventoryKind("HOTEL"),
      bookingIdsForInventoryKind("ACTIVITY"),
      bookingIdsWithExternalType("HOTEL"),
      bookingIdsWithExternalType("ACTIVITY"),
      prisma.booking.findMany({ select: { id: true } }),
    ]);
    const claimedByHotelOrActivity = new Set([
      ...hotelIds,
      ...activityIds,
      ...noteHotelIds,
      ...noteActivityIds,
    ]);
    // Everything not claimed by Hotel/Activity (including orphans) lands on Holiday Bookings
    where.id = {
      in: allBookings.filter((b) => !claimedByHotelOrActivity.has(b.id)).map((b) => b.id),
    };
    return where;
  }

  if ((PRODUCT_INVENTORY_KINDS as readonly string[]).includes(filter.hasItemKind)) {
    const kind = filter.hasItemKind as "HOTEL" | "ACTIVITY";
    const [fromItems, fromNotes] = await Promise.all([
      bookingIdsForInventoryKind(kind),
      bookingIdsWithExternalType(kind),
    ]);
    where.id = { in: [...new Set([...fromItems, ...fromNotes])] };
    return where;
  }

  const items = await prisma.bookingItem.findMany({ where: { kind: filter.hasItemKind }, select: { bookingId: true } });
  where.id = { in: items.map((i) => i.bookingId) };
  return where;
}

/**
 * Single source of truth for which Booking Management tab a booking belongs in:
 * inventory line kinds → packageId / PACKAGE items → externalBookingType notes → PACKAGE.
 */
async function resolveCategories(
  bookings: Array<{ id: string; packageId: string | null; internalNotes: string | null }>,
  itemsByBooking: Map<string, any[]>
): Promise<Map<string, BookingCategory>> {
  const inventoryIds = new Set<string>();
  for (const items of itemsByBooking.values()) {
    for (const item of items) {
      if (item.kind === "INVENTORY" && item.inventoryItemId) inventoryIds.add(item.inventoryItemId);
    }
  }

  const inventoryKindById = new Map<string, string>();
  if (inventoryIds.size > 0) {
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { id: { in: Array.from(inventoryIds) } },
      select: { id: true, kind: true },
    });
    for (const item of inventoryItems) inventoryKindById.set(item.id, item.kind);
  }

  const categoryByBooking = new Map<string, BookingCategory>();
  for (const booking of bookings) {
    const items = itemsByBooking.get(booking.id) ?? [];
    const itemKinds = new Set(
      items.map((item) => (item.kind === "INVENTORY" ? inventoryKindById.get(item.inventoryItemId ?? "") : item.kind))
    );
    categoryByBooking.set(
      booking.id,
      categorizeFromSignals({
        packageId: booking.packageId,
        internalNotes: booking.internalNotes,
        itemKinds,
      })
    );
  }
  return categoryByBooking;
}

export class PrismaBookingRepository implements BookingRepository {
  async findById(id: string): Promise<Result<Booking | null, AppError>> {
    const row = await prisma.booking.findUnique({
      where: { id },
    });
    if (!row) return ok(null);

    const [items, travellers] = await Promise.all([
      prisma.bookingItem.findMany({ where: { bookingId: id } }),
      prisma.traveller.findMany({ where: { bookingId: id } }),
    ]);
    const categories = await resolveCategories(
      [{ id, packageId: row.packageId, internalNotes: row.internalNotes }],
      new Map([[id, items]])
    );

    return ok(toDomain({ ...row, items, travellers, bookingCategory: categories.get(id) ?? "PACKAGE" }));
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count({ where }),
    ]);

    const bookingIds = rows.map((r) => r.id);
    const [allItems, allTravellers] = await Promise.all([
      bookingIds.length > 0 ? prisma.bookingItem.findMany({ where: { bookingId: { in: bookingIds } } }) : Promise.resolve([]),
      bookingIds.length > 0 ? prisma.traveller.findMany({ where: { bookingId: { in: bookingIds } } }) : Promise.resolve([]),
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

    const categories = await resolveCategories(
      rows.map((row) => ({ id: row.id, packageId: row.packageId, internalNotes: row.internalNotes })),
      itemsByBooking
    );
    const domainRows = rows.map((row) =>
      toDomain({
        ...row,
        items: itemsByBooking.get(row.id) ?? [],
        travellers: travellersByBooking.get(row.id) ?? [],
        bookingCategory: categories.get(row.id) ?? "PACKAGE",
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
