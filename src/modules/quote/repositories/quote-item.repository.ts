import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { QuoteItem } from "../types/quote-item";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface QuoteItemRepository extends BaseRepository<QuoteItem, string> {
  findByQuote(quoteId: string): Promise<Result<QuoteItem[], AppError>>;
}

export class PrismaQuoteItemRepository extends PrismaStore<any> implements QuoteItemRepository {
  constructor() {
    super(prisma.quoteItem);
  }

  async findByQuote(quoteId: string): Promise<Result<QuoteItem[], AppError>> {
    return ok(
      (await this.delegate.findMany())
        .filter(( item: any ) => item.quoteId === quoteId)
        .sort(( a: any, b: any ) => a.position - b.position)
    );
  }
}
