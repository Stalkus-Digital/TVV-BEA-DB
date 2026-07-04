import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getQuoteItemService } from "../module";
import type { QuoteItem } from "../types/quote-item";

export async function listQuoteItemsHandler(quoteId: string): Promise<Result<QuoteItem[], AppError>> {
  return getQuoteItemService().listByQuote(quoteId);
}

export async function addQuoteItemHandler(quoteId: string, body: unknown): Promise<Result<QuoteItem, AppError>> {
  return getQuoteItemService().add(quoteId, body);
}

export async function updateQuoteItemHandler(quoteId: string, itemId: string, body: unknown): Promise<Result<QuoteItem, AppError>> {
  return getQuoteItemService().update(quoteId, itemId, body);
}

export async function removeQuoteItemHandler(quoteId: string, itemId: string): Promise<Result<void, AppError>> {
  return getQuoteItemService().remove(quoteId, itemId);
}
