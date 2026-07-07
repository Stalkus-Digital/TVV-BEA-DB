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
    let items = (await this.delegate.findMany());
    if (filter.status) items = items.filter(( b: any ) => b.status === filter.status);
    if (filter.destinationId) items = items.filter(( b: any ) => b.destinationId === filter.destinationId);
    if (filter.sourceQuoteId) items = items.filter(( b: any ) => b.sourceQuoteId === filter.sourceQuoteId);
    if (filter.customerId) items = items.filter(( b: any ) => b.customerId === filter.customerId);

    const page = filter.page ?? DEFAULT_PAGINATION.page;
    const pageSize = filter.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }

  async countAll(): Promise<Result<number, AppError>> {
    return ok((await this.delegate.count()));
  }
}
