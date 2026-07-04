import { DEFAULT_PAGINATION, ok, toPaginatedResult, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Booking } from "../types/booking";
import type { BookingStatus } from "../types/booking-status";
import { InMemoryStore } from "./in-memory-store";

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

export class InMemoryBookingRepository implements BookingRepository {
  private readonly store = new InMemoryStore<Booking>("Booking");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<Booking, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<Booking, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByFilter(filter: BookingListFilter): Promise<Result<PaginatedResult<Booking>, AppError>> {
    let items = this.store.all();
    if (filter.status) items = items.filter((b) => b.status === filter.status);
    if (filter.destinationId) items = items.filter((b) => b.destinationId === filter.destinationId);
    if (filter.sourceQuoteId) items = items.filter((b) => b.sourceQuoteId === filter.sourceQuoteId);
    if (filter.customerId) items = items.filter((b) => b.customerId === filter.customerId);

    const page = filter.page ?? DEFAULT_PAGINATION.page;
    const pageSize = filter.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }

  async countAll(): Promise<Result<number, AppError>> {
    return ok(this.store.all().length);
  }
}
