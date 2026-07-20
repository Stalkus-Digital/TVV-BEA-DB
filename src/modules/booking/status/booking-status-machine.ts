import { BookingStatus } from "../types/booking-status";

/**
 * Pure state machine, no I/O — services validate every transition through
 * this before writing, rather than hand-checking status strings inline at
 * each call site.
 */
export const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.DRAFT]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.PARTIALLY_PAID, BookingStatus.PAID, BookingStatus.CANCELLED],
  // Refunds may reduce paid amount — allow stepping back toward CONFIRMED
  [BookingStatus.PARTIALLY_PAID]: [BookingStatus.PAID, BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.PAID]: [BookingStatus.TICKETED, BookingStatus.PARTIALLY_PAID, BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.TICKETED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return BOOKING_STATUS_TRANSITIONS[from].includes(to);
}

export const TERMINAL_STATUSES: BookingStatus[] = [BookingStatus.COMPLETED, BookingStatus.CANCELLED];

export function isTerminal(status: BookingStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}
