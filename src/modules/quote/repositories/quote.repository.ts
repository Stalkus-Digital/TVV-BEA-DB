import { DEFAULT_PAGINATION, ok, toPaginatedResult, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { Quote, QuoteStatus } from "../types/quote";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

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

export class PrismaQuoteRepository extends PrismaStore<any> implements QuoteRepository {
  constructor() {
    super(prisma.quote);
  }

  async findByNumber(quoteNumber: string): Promise<Result<Quote | null, AppError>> {
    return ok((await this.delegate.findMany()).find(( q: any ) => q.quoteNumber === quoteNumber) ?? null);
  }

  async findByFilter(filter: QuoteListFilter): Promise<Result<PaginatedResult<Quote>, AppError>> {
    let items = (await this.delegate.findMany());
    if (filter.status) items = items.filter(( q: any ) => q.status === filter.status);
    if (filter.destinationId) items = items.filter(( q: any ) => q.destinationId === filter.destinationId);
    if (filter.packageId) items = items.filter(( q: any ) => q.packageId === filter.packageId);
    if (filter.customerId) items = items.filter(( q: any ) => q.customerId === filter.customerId);

    const page = filter.page ?? DEFAULT_PAGINATION.page;
    const pageSize = filter.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }

  async countAll(): Promise<Result<number, AppError>> {
    return ok((await this.delegate.count()));
  }
}
