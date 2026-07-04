import type { Destination } from "@/modules/destination";
import type { Quote } from "../types/quote";
import type { QuoteItem } from "../types/quote-item";
import type { QuotePriceResult } from "../types/quote-pricing";
import type { QuotePdfData } from "../types/quote-pdf";

/** Pure data assembly, no I/O — mirrors website/seo/seo-builder.ts's "pure builder" shape. */
export function buildQuotePdfData(quote: Quote, items: QuoteItem[], pricing: QuotePriceResult, destination: Destination): QuotePdfData {
  return {
    quoteNumber: quote.quoteNumber,
    title: quote.title,
    status: quote.status,
    issuedAt: quote.createdAt,
    validFrom: quote.validFrom,
    validTo: quote.validTo,
    isExpired: new Date(quote.validTo).getTime() < Date.now(),
    destination: { id: destination.id, name: destination.name, slug: destination.slug },
    travelerDetails: quote.travelerDetails,
    lineItems: items.map((item) => ({
      title: item.title,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.quantity,
    })),
    pricing: {
      currency: pricing.currency,
      itemsSubtotal: pricing.itemsSubtotal,
      adjustmentLines: pricing.lineItems.filter((line) => line.label !== "Items subtotal"),
      total: pricing.total,
    },
    internalNotes: quote.internalNotes,
    customerNotes: quote.customerNotes,
  };
}
