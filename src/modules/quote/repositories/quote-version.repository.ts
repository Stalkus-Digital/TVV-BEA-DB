import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { QuoteVersion } from "../types/quote-version";
import { InMemoryStore } from "./in-memory-store";

export interface QuoteVersionRepository extends BaseRepository<QuoteVersion, string> {
  findByQuote(quoteId: string): Promise<Result<QuoteVersion[], AppError>>;
  findLatest(quoteId: string): Promise<Result<QuoteVersion | null, AppError>>;
}

export class InMemoryQuoteVersionRepository implements QuoteVersionRepository {
  private readonly store = new InMemoryStore<QuoteVersion>("Quote version");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<QuoteVersion, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<QuoteVersion, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByQuote(quoteId: string): Promise<Result<QuoteVersion[], AppError>> {
    return ok(
      this.store
        .all()
        .filter((v) => v.quoteId === quoteId)
        .sort((a, b) => b.versionNumber - a.versionNumber)
    );
  }

  async findLatest(quoteId: string): Promise<Result<QuoteVersion | null, AppError>> {
    const versions = this.store.all().filter((v) => v.quoteId === quoteId);
    if (versions.length === 0) return ok(null);
    return ok(versions.reduce((latest, v) => (v.versionNumber > latest.versionNumber ? v : latest)));
  }
}
