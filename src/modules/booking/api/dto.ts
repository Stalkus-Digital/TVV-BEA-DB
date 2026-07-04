import type { BookingStatus } from "../types/booking-status";

export interface ListBookingsQuery {
  status?: BookingStatus;
  destinationId?: string;
  sourceQuoteId?: string;
  page?: number;
  pageSize?: number;
}
