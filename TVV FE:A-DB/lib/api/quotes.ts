import { apiClient } from "./client";
import { endpoints } from "./config";

export interface QuoteRequestInput {
  name: string;
  email: string;
  phone?: string;
  destination?: string;
  tripType?: string;
  travelDates?: string;
  guests?: number;
  budget?: string;
  message: string;
  source?: string;
  packageSlug?: string;
}

export interface QuoteSummary {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  destinationId: string;
  packageId: string | null;
  currency: string;
  validFrom: string;
  validTo: string;
  customerNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TravelOsQuote {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  destinationId: string;
  packageId: string | null;
  currency: string;
  validFrom: string;
  validTo: string;
  customerNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TravelOsPaginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface TravelOsEnquiry {
  id: string;
  status: string;
}

function toQuoteSummary(quote: TravelOsQuote): QuoteSummary {
  return {
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    title: quote.title,
    status: quote.status,
    destinationId: quote.destinationId,
    packageId: quote.packageId,
    currency: quote.currency,
    validFrom: quote.validFrom,
    validTo: quote.validTo,
    customerNotes: quote.customerNotes,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
  };
}

/**
 * Despite the name (kept because existing callers — `EnquiryForm.tsx` via
 * `quotesFeatureService.submit()` — already depend on it), this is the
 * site-wide "Plan my trip" contact form, not a request against one
 * specific catalog Package. It maps onto Travel OS's public
 * `POST /api/enquiries` (anonymous-friendly lead capture, attaches the
 * caller's `customerId` automatically if they happen to be logged in) —
 * not `POST /api/me/quotes`, which requires a logged-in customer and a
 * real `packageSlug` neither this form nor any current UI collects. See
 * docs/38_CUSTOMER_INTEGRATION.md for the full reasoning.
 *
 * Every field this form collects beyond name/email/phone/message
 * (destination, trip type, dates, party size, budget) has no dedicated
 * field on Travel OS's Enquiry model, so — same as this form already did
 * for from-city/duration/party-size before this fix — it's folded into
 * `message` rather than silently dropped.
 */
export async function submitQuoteRequest(input: QuoteRequestInput): Promise<{ id: string }> {
  const detailLines: string[] = [];
  if (input.destination) detailLines.push(`Destination: ${input.destination}`);
  if (input.tripType) detailLines.push(`Trip type: ${input.tripType}`);
  if (input.travelDates) detailLines.push(`Dates: ${input.travelDates}`);
  if (input.guests) detailLines.push(`Guests: ${input.guests}`);
  if (input.budget) detailLines.push(`Budget: ${input.budget}`);

  const message = [input.message.trim(), detailLines.join("\n")].filter(Boolean).join("\n\n");

  const body = await apiClient.post<TravelOsEnquiry>(endpoints.enquiries.submit, {
    type: "GENERAL",
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    message: message || null,
    packageSlug: input.packageSlug || null,
    source: input.source || null,
  });
  if (!body?.id) throw new Error("Invalid enquiry response");
  return { id: body.id };
}

/** Real, row-scoped customer quotes — `GET /api/me/quotes`, never another customer's. */
export async function fetchMyQuotes(): Promise<QuoteSummary[]> {
  const body = await apiClient.get<TravelOsPaginated<TravelOsQuote>>(endpoints.quotes.list);
  return (body?.items ?? []).map(toQuoteSummary);
}

export async function fetchQuoteById(id: string): Promise<QuoteSummary | null> {
  const body = await apiClient.get<TravelOsQuote>(endpoints.quotes.detail(id), { treat404AsNull: true });
  return body ? toQuoteSummary(body) : null;
}
