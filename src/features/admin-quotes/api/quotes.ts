import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import type { PaginatedResult } from "@/lib/admin-api/types";
import type {
  BookingHandoffPayload,
  CreateQuoteInput,
  CreateQuoteItemInput,
  DestinationOption,
  Quote,
  QuoteItem,
  QuoteListFilters,
  QuotePriceResult,
  QuoteVersion,
  UpdateQuoteInput,
} from "../types";

function quotePath(id: string) {
  return `${adminEndpoints.quotes}/${id}`;
}

export async function fetchQuotes(filters: QuoteListFilters = {}): Promise<PaginatedResult<Quote>> {
  const result = await adminApiClient.get<PaginatedResult<Quote>>(adminEndpoints.quotes, {
    params: {
      status: filters.status,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
    },
  });
  if (!result) {
    return { items: [], page: 1, pageSize: filters.pageSize ?? 20, total: 0, totalPages: 1 };
  }
  return result;
}

export async function fetchAllQuotes(filters: Pick<QuoteListFilters, "status"> = {}): Promise<Quote[]> {
  const pageSize = 20;
  let page = 1;
  let totalPages = 1;
  const items: Quote[] = [];

  while (page <= totalPages) {
    const result = await fetchQuotes({ ...filters, page, pageSize });
    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  return items;
}

export async function fetchQuote(id: string): Promise<Quote> {
  const result = await adminApiClient.get<Quote>(quotePath(id));
  if (!result) throw new Error("Quote not found");
  return result;
}

export async function createQuote(input: CreateQuoteInput): Promise<Quote> {
  const result = await adminApiClient.post<Quote>(adminEndpoints.quotes, input);
  if (!result) throw new Error("Failed to create quote");
  return result;
}

export async function updateQuote(id: string, input: UpdateQuoteInput): Promise<Quote> {
  const result = await adminApiClient.patch<Quote>(quotePath(id), input);
  if (!result) throw new Error("Failed to update quote");
  return result;
}

export async function sendQuote(id: string, changeNote?: string | null): Promise<Quote> {
  const result = await adminApiClient.post<Quote>(`${quotePath(id)}/send`, { changeNote: changeNote ?? null });
  if (!result) throw new Error("Failed to send quote");
  return result;
}

export async function approveQuote(id: string): Promise<Quote> {
  const result = await adminApiClient.post<Quote>(`${quotePath(id)}/approve`, {});
  if (!result) throw new Error("Failed to approve quote");
  return result;
}

export async function rejectQuote(id: string, reason: string): Promise<Quote> {
  const result = await adminApiClient.post<Quote>(`${quotePath(id)}/reject`, { reason });
  if (!result) throw new Error("Failed to reject quote");
  return result;
}

export async function duplicateQuote(id: string): Promise<Quote> {
  const result = await adminApiClient.post<Quote>(`${quotePath(id)}/duplicate`, {});
  if (!result) throw new Error("Failed to duplicate quote");
  return result;
}

export async function convertQuote(id: string): Promise<BookingHandoffPayload> {
  const result = await adminApiClient.post<BookingHandoffPayload>(`${quotePath(id)}/convert`, {});
  if (!result) throw new Error("Failed to convert quote");
  return result;
}

export async function fetchQuoteItems(id: string): Promise<QuoteItem[]> {
  const result = await adminApiClient.get<QuoteItem[]>(`${quotePath(id)}/items`);
  return result ?? [];
}

export async function addQuoteItem(id: string, input: CreateQuoteItemInput): Promise<QuoteItem> {
  const result = await adminApiClient.post<QuoteItem>(`${quotePath(id)}/items`, input);
  if (!result) throw new Error("Failed to add quote item");
  return result;
}

export async function updateQuoteItem(quoteId: string, itemId: string, input: Partial<CreateQuoteItemInput>): Promise<QuoteItem> {
  const result = await adminApiClient.patch<QuoteItem>(`${quotePath(quoteId)}/items/${itemId}`, input);
  if (!result) throw new Error("Failed to update quote item");
  return result;
}

export async function deleteQuoteItem(quoteId: string, itemId: string): Promise<void> {
  await adminApiClient.delete(`${quotePath(quoteId)}/items/${itemId}`);
}

export async function deleteQuote(id: string): Promise<void> {
  await adminApiClient.delete(quotePath(id));
}

export async function fetchQuotePricing(id: string): Promise<QuotePriceResult> {
  const result = await adminApiClient.get<QuotePriceResult>(`${quotePath(id)}/pricing`);
  if (!result) throw new Error("Pricing unavailable");
  return result;
}

export async function fetchQuoteVersions(id: string): Promise<QuoteVersion[]> {
  const result = await adminApiClient.get<QuoteVersion[]>(`${quotePath(id)}/versions`);
  return result ?? [];
}

export async function fetchAllDestinations(): Promise<DestinationOption[]> {
  const pageSize = 20;
  let page = 1;
  let totalPages = 1;
  const items: DestinationOption[] = [];

  while (page <= totalPages) {
    const result = await adminApiClient.get<PaginatedResult<DestinationOption>>(adminEndpoints.destinations, {
      params: { page, pageSize },
    });
    if (!result) break;
    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  return items;
}

export async function fetchPricingForQuotes(quotes: Quote[]): Promise<Map<string, number>> {
  const entries = await Promise.all(
    quotes.map(async (quote) => {
      try {
        const pricing = await fetchQuotePricing(quote.id);
        return [quote.id, pricing.total] as const;
      } catch {
        return [quote.id, null] as const;
      }
    })
  );

  const map = new Map<string, number>();
  for (const [id, total] of entries) {
    if (total != null) map.set(id, total);
  }
  return map;
}
