import type { AppError } from "@/shared/errors";
import type { PaginatedResult, Result } from "@/shared/types";
import { getQuoteService, getQuoteVersionService } from "../module";
import type { Quote } from "../types/quote";
import type { BookingHandoffPayload } from "../types/quote-conversion";
import type { QuotePdfData } from "../types/quote-pdf";
import type { QuotePriceResult } from "../types/quote-pricing";
import type { QuoteVersion } from "../types/quote-version";
import type { ListQuotesQuery } from "./dto";

export async function listQuotesHandler(query: ListQuotesQuery): Promise<Result<PaginatedResult<Quote>, AppError>> {
  return getQuoteService().list(query);
}

export async function getQuoteHandler(id: string): Promise<Result<Quote, AppError>> {
  return getQuoteService().getById(id);
}

export async function createQuoteHandler(body: unknown): Promise<Result<Quote, AppError>> {
  return getQuoteService().create(body);
}

export async function updateQuoteHandler(id: string, body: unknown): Promise<Result<Quote, AppError>> {
  return getQuoteService().update(id, body);
}

export async function sendQuoteHandler(id: string, changeNote: string | null): Promise<Result<Quote, AppError>> {
  return getQuoteService().send(id, changeNote);
}

export async function approveQuoteHandler(id: string): Promise<Result<Quote, AppError>> {
  return getQuoteService().approve(id);
}

export async function rejectQuoteHandler(id: string, body: unknown): Promise<Result<Quote, AppError>> {
  return getQuoteService().reject(id, body);
}

export async function duplicateQuoteHandler(id: string): Promise<Result<Quote, AppError>> {
  return getQuoteService().duplicate(id);
}

export async function convertQuoteHandler(id: string): Promise<Result<BookingHandoffPayload, AppError>> {
  return getQuoteService().convertToBooking(id);
}

export async function getQuotePricingHandler(id: string): Promise<Result<QuotePriceResult, AppError>> {
  return getQuoteService().computePricing(id);
}

export async function getQuotePdfHandler(id: string): Promise<Result<QuotePdfData, AppError>> {
  return getQuoteService().getPdfData(id);
}

export async function listQuoteVersionsHandler(id: string): Promise<Result<QuoteVersion[], AppError>> {
  return getQuoteVersionService().listByQuote(id);
}
