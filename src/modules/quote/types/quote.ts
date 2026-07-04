import type { QuoteAdjustment } from "./quote-adjustment";

export const QuoteStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CONVERTED: "CONVERTED",
} as const;

export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

export interface LeadTraveler {
  name: string;
  email: string;
  phone: string | null;
}

export interface TravelerDetails {
  leadTraveler: LeadTraveler;
  adults: number;
  children: number;
  infants: number;
}

/**
 * A priced-but-not-yet-booked itinerary shared with a customer before
 * commitment — resolves the ambiguity CLAUDE.md flagged when "Quote" was
 * first named ("is a Quote a Package draft, a Booking pre-status, or its
 * own entity?"): it is its own bounded-context entity, not a status on
 * either Package or the not-yet-built Booking.
 *
 * References Destination directly (every quote belongs to one) and
 * optionally a source Package (a quote can be built off a catalog package
 * or assembled from scratch via QuoteItems only) — both resolved through
 * their modules' public services, never duplicated here. Line items live
 * in their own repository (../quote-item.ts), same "too numerous to embed"
 * reasoning as Package's Days/Items.
 */
export interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  status: QuoteStatus;
  destinationId: string;
  packageId: string | null;
  travelerDetails: TravelerDetails;
  currency: string;
  adjustments: QuoteAdjustment[];
  currentVersionId: string | null;
  validFrom: string;
  validTo: string;
  internalNotes: string | null;
  customerNotes: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  convertedAt: string | null;
  /**
   * Reserved but inert: only a real Booking Engine (Sprint 8, not built
   * yet) could ever populate this, and this module has no import from a
   * booking module to fabricate one itself. Same pattern as
   * Package.aiGeneratedFromId.
   */
  convertedBookingId: string | null;
  /**
   * Owning customer (Sprint 13 — Customer Experience Platform) — null for
   * staff-created quotes with no registered account behind them. Set only
   * by `QuoteService.create()`'s explicit `customerId` parameter, sourced
   * server-side from the authenticated session; never accepted as part of
   * the validated request body.
   */
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
}
