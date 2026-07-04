import { DEFAULT_PAGINATION, ok, toPaginatedResult, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Quote, QuoteStatus } from "../types/quote";
import { InMemoryStore } from "./in-memory-store";

export interface QuoteListFilter extends PaginationParams {
  status?: QuoteStatus;
  destinationId?: string;
  packageId?: string;
  /** Sprint 13 — row-level ownership scoping, e.g. `getQuoteService().list({ customerId })`. */
  customerId?: string;
}

export interface QuoteRepository extends BaseRepository<Quote, string> {
  findByNumber(quoteNumber: string): Promise<Result<Quote | null, AppError>>;
  findByFilter(filter: QuoteListFilter): Promise<Result<PaginatedResult<Quote>, AppError>>;
  countAll(): Promise<Result<number, AppError>>;
}

export class InMemoryQuoteRepository implements QuoteRepository {
  private readonly store = new InMemoryStore<Quote>("Quote");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<Quote, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<Quote, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByNumber(quoteNumber: string): Promise<Result<Quote | null, AppError>> {
    return ok(this.store.all().find((q) => q.quoteNumber === quoteNumber) ?? null);
  }

  async findByFilter(filter: QuoteListFilter): Promise<Result<PaginatedResult<Quote>, AppError>> {
    let items = this.store.all();
    if (filter.status) items = items.filter((q) => q.status === filter.status);
    if (filter.destinationId) items = items.filter((q) => q.destinationId === filter.destinationId);
    if (filter.packageId) items = items.filter((q) => q.packageId === filter.packageId);
    if (filter.customerId) items = items.filter((q) => q.customerId === filter.customerId);

    const page = filter.page ?? DEFAULT_PAGINATION.page;
    const pageSize = filter.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }

  async countAll(): Promise<Result<number, AppError>> {
    return ok(this.store.all().length);
  }
}
