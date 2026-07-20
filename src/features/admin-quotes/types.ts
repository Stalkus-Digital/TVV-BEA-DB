import type { AdjustmentKind, AdjustmentType } from "./constants";

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

export interface QuoteAdjustment {
  id: string;
  kind: AdjustmentKind;
  type: AdjustmentType;
  label: string;
  value: number;
}

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
  convertedBookingId: string | null;
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteListRow extends Quote {
  totalAmount: number | null;
  customerLabel: string;
}

export interface PaginatedQuotes {
  items: QuoteListRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type QuoteSortField = "createdAt" | "validTo" | "title" | "status" | "totalAmount";
export type SortDirection = "asc" | "desc";

export interface QuoteListFilters {
  status?: QuoteStatus;
  customerId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: QuoteSortField;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
}

export const QuoteItemKind = {
  PACKAGE: "PACKAGE",
  INVENTORY: "INVENTORY",
  CUSTOM: "CUSTOM",
} as const;

export type QuoteItemKind = (typeof QuoteItemKind)[keyof typeof QuoteItemKind];

export interface QuoteItem {
  id: string;
  quoteId: string;
  kind: QuoteItemKind;
  packageId: string | null;
  inventoryItemId: string | null;
  title: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuotePriceLineItem {
  label: string;
  amount: number;
}

export interface QuotePriceResult {
  currency: string;
  itemsSubtotal: number;
  lineItems: QuotePriceLineItem[];
  total: number;
}

export interface QuoteVersion {
  id: string;
  quoteId: string;
  versionNumber: number;
  snapshot: unknown;
  createdAt: string;
  changeNote: string | null;
}

export interface BookingHandoffPayload {
  quoteId: string;
  quoteNumber: string;
  destinationId: string;
  packageId: string | null;
  travelerDetails: TravelerDetails;
  items: QuoteItem[];
  pricing: QuotePriceResult;
  preparedAt: string;
}

export interface QuoteTimelineEvent {
  id: string;
  kind: "created" | "updated" | "version" | "approved" | "rejected" | "converted";
  title: string;
  subtitle: string;
  createdAt: string;
}

export interface CreateQuoteInput {
  title: string;
  destinationId: string;
  packageId?: string | null;
  travelerDetails: TravelerDetails;
  currency?: string;
  adjustments?: Omit<QuoteAdjustment, "id">[];
  validFrom?: string;
  validTo?: string;
  internalNotes?: string | null;
  customerNotes?: string | null;
}

export interface UpdateQuoteInput {
  title?: string;
  destinationId?: string;
  packageId?: string | null;
  travelerDetails?: TravelerDetails;
  currency?: string;
  adjustments?: QuoteAdjustment[];
  validFrom?: string;
  validTo?: string;
  internalNotes?: string | null;
  customerNotes?: string | null;
}

export interface CreateQuoteItemInput {
  title: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  packageId?: string | null;
  inventoryItemId?: string | null;
}

export interface DestinationOption {
  id: string;
  name: string;
  slug: string;
}
