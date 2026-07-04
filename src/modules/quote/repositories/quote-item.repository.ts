import { ok, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { QuoteItem } from "../types/quote-item";
import { InMemoryStore } from "./in-memory-store";

export interface QuoteItemRepository extends BaseRepository<QuoteItem, string> {
  findByQuote(quoteId: string): Promise<Result<QuoteItem[], AppError>>;
}

export class InMemoryQuoteItemRepository implements QuoteItemRepository {
  private readonly store = new InMemoryStore<QuoteItem>("Quote item");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<QuoteItem, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<QuoteItem, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByQuote(quoteId: string): Promise<Result<QuoteItem[], AppError>> {
    return ok(
      this.store
        .all()
        .filter((item) => item.quoteId === quoteId)
        .sort((a, b) => a.position - b.position)
    );
  }
}
