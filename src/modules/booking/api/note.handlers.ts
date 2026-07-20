import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import type { AuthContext } from "@/modules/auth";
import { getBookingNoteService } from "../module";
import type { BookingNote } from "../types/booking-note";

export async function listNotesHandler(bookingId: string): Promise<Result<BookingNote[], AppError>> {
  return getBookingNoteService().listByBooking(bookingId);
}

export async function addNoteHandler(
  bookingId: string,
  body: unknown,
  context: AuthContext | null = null
): Promise<Result<BookingNote, AppError>> {
  return getBookingNoteService().add(bookingId, body, context?.userId ?? null);
}
