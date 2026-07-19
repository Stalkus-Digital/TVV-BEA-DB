import type { BookingStatus } from "./constants";
import type { PaymentStatus } from "./constants";

export type { BookingStatus, PaymentStatus };

export interface BookingItem {
  id: string;
  bookingId: string;
  kind: string;
  packageId: string | null;
  inventoryItemId: string | null;
  title: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  supplierBookingReference: any | null;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  sourceQuoteId: string;
  sourceQuoteNumber: string;
  sourceQuoteVersionId: string | null;
  destinationId: string;
  packageId: string | null;
  currency: string;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  internalNotes: string | null;
  confirmedAt: string | null;
  ticketedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
  items?: BookingItem[];
  travellers?: Traveller[];
  /** BOOK-002: derived server-side from BookingItem/InventoryItem kind — the real signal for which Booking Management tab this belongs in. */
  bookingCategory?: "PACKAGE" | "HOTEL" | "ACTIVITY";
}

export interface BookingListRow extends Booking {
  customerLabel: string;
  packageLabel: string;
  travelDate: string | null;
}

export interface PaginatedBookings {
  items: BookingListRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type BookingSortField =
  | "createdAt"
  | "bookingNumber"
  | "status"
  | "paymentStatus"
  | "totalAmount"
  | "amountPaid";

export type SortDirection = "asc" | "desc";

export interface BookingListFilters {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: BookingSortField;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
  hasItemKind?: string;
}

export interface Traveller {
  id: string;
  bookingId: string;
  type: string;
  isLeadTraveller: boolean;
  fullName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiry: string | null;
  visaRequired: boolean;
  emergencyContact: { name: string; phone: string; relation: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingPayment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: string | null;
  status: PaymentStatus;
  reference: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PassengerDocument {
  id: string;
  bookingId: string;
  travellerId: string | null;
  kind: string;
  fileUrl: string | null;
  fileName: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface BookingNote {
  id: string;
  bookingId: string;
  body: string;
  createdAt: string;
}

export interface BookingTimelineEntry {
  id: string;
  bookingId: string;
  event: string;
  occurredAt: string;
  details: string | null;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  changedAt: string;
  note: string | null;
}

export interface BookingVoucher {
  id: string;
  bookingId: string;
  voucherNumber: string;
  issuedAt: string;
  leadTravellerName: string;
  destinationName: string;
  validity: { validFrom: string; validTo: string } | null;
  items: { title: string; description: string | null; quantity: number }[];
  notes: string | null;
  createdAt: string;
}

export interface BookingInvoice {
  id: string;
  bookingId: string;
  invoiceNumber: string;
  issuedAt: string;
  billTo: { name: string; email: string; phone: string | null };
  currency: string;
  lineItems: { title: string; quantity: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  createdAt: string;
}

export interface MergedTimelineEvent {
  id: string;
  kind: "timeline" | "status" | "payment" | "note" | "traveller";
  title: string;
  subtitle: string;
  occurredAt: string;
}

export interface CreateBookingInput {
  quoteId: string;
  internalNotes?: string | null;
}

export interface RecordPaymentInput {
  amount: number;
  method?: string | null;
  status?: PaymentStatus;
  reference?: string | null;
  notes?: string | null;
}

export interface AddTravellerInput {
  type?: string;
  isLeadTraveller?: boolean;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  passportNumber?: string | null;
  passportExpiry?: string | null;
  visaRequired?: boolean;
}

export interface AddDocumentInput {
  travellerId?: string | null;
  kind: string;
  fileUrl?: string | null;
  fileName?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
}
