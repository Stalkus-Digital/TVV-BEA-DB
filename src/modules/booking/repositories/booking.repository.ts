import { DEFAULT_PAGINATION, ok, toPaginatedResult, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Booking } from "../types/booking";
import type { BookingStatus } from "../types/booking-status";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface BookingListFilter extends PaginationParams {
  status?: BookingStatus;
  destinationId?: string;
  sourceQuoteId?: string;
  /** Sprint 13 — row-level ownership scoping, e.g. `getBookingService().list({ customerId })`. */
  customerId?: string;
  hasItemKind?: string;
}

export interface BookingRepository extends BaseRepository<Booking, string> {
  findByFilter(filter: BookingListFilter): Promise<Result<PaginatedResult<Booking>, AppError>>;
  countAll(): Promise<Result<number, AppError>>;
}

export class PrismaBookingRepository extends PrismaStore<any> implements BookingRepository {
  constructor() {
    super(prisma.booking);
  }

  async findByFilter(filter: BookingListFilter): Promise<Result<PaginatedResult<Booking>, AppError>> {
    const page = filter.page ?? DEFAULT_PAGINATION.page;
    const pageSize = filter.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.destinationId) where.destinationId = filter.destinationId;
    if (filter.sourceQuoteId) where.sourceQuoteId = filter.sourceQuoteId;
    if (filter.customerId) where.customerId = filter.customerId;
    if (filter.hasItemKind) {
      if (filter.hasItemKind === "HOLIDAY_OR_PACKAGE") {
        where.OR = [
          { packageId: { not: null } },
          { items: { some: { kind: "PACKAGE" } } }
        ];
      } else {
        where.items = { some: { kind: filter.hasItemKind } };
      }
    }

    const [items, total] = await Promise.all([
      this.delegate.findMany({
        where,
        skip,
        take: pageSize,
        include: { items: true, travellers: true }
      }),
      this.delegate.count({ where })
    ]);

    return ok(toPaginatedResult(items, total, { page, pageSize }));
  }

  async countAll(): Promise<Result<number, AppError>> {
    return ok((await this.delegate.count()));
  }
}
