import type { BookingStatus } from "../types/booking-status";

export interface ListBookingsQuery {
  status?: BookingStatus;
  destinationId?: string;
  sourceQuoteId?: string;
  hasItemKind?: string;
  page?: number;
  pageSize?: number;
}
