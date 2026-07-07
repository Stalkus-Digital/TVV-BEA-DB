import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { QuoteVersion } from "../types/quote-version";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface QuoteVersionRepository extends BaseRepository<QuoteVersion, string> {
  findByQuote(quoteId: string): Promise<Result<QuoteVersion[], AppError>>;
  findLatest(quoteId: string): Promise<Result<QuoteVersion | null, AppError>>;
}

export class PrismaQuoteVersionRepository extends PrismaStore<any> implements QuoteVersionRepository {
  constructor() {
    super(prisma.quoteVersion);
  }

  async findByQuote(quoteId: string): Promise<Result<QuoteVersion[], AppError>> {
    return ok(
      (await this.delegate.findMany())
        .filter(( v: any ) => v.quoteId === quoteId)
        .sort(( a: any, b: any ) => b.versionNumber - a.versionNumber)
    );
  }

  async findLatest(quoteId: string): Promise<Result<QuoteVersion | null, AppError>> {
    const versions = (await this.delegate.findMany()).filter(( v: any ) => v.quoteId === quoteId);
    if (versions.length === 0) return ok(null);
    return ok(versions.reduce((latest: any, v: any) => (v.versionNumber > latest.versionNumber ? v : latest)));
  }
}
