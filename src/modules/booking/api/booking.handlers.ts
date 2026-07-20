import type { AppError } from "@/shared/errors";
import type { PaginatedResult, Result } from "@/shared/types";
import type { AuthContext } from "@/modules/auth";
import { getBookingService } from "../module";
import type { Booking } from "../types/booking";
import type { ListBookingsQuery } from "./dto";

export async function listBookingsHandler(query: ListBookingsQuery): Promise<Result<PaginatedResult<Booking>, AppError>> {
  return getBookingService().list(query);
}

export async function getBookingHandler(id: string): Promise<Result<Booking, AppError>> {
  return getBookingService().getById(id);
}

export async function createBookingHandler(
  body: unknown,
  context: AuthContext | null = null
): Promise<Result<Booking, AppError>> {
  return getBookingService().createFromQuote(body, context?.userId ?? null);
}

export async function updateBookingHandler(
  id: string,
  body: unknown,
  context: AuthContext | null = null
): Promise<Result<Booking, AppError>> {
  return getBookingService().update(id, body, context?.userId ?? null);
}

export async function deleteBookingHandler(
  id: string,
  context: AuthContext | null = null
): Promise<Result<void, AppError>> {
  return getBookingService().delete(id, context?.userId ?? null);
}

export async function confirmBookingHandler(
  id: string,
  context: AuthContext | null = null
): Promise<Result<Booking, AppError>> {
  return getBookingService().confirm(id, context?.userId ?? null);
}

export async function cancelBookingHandler(
  id: string,
  body: unknown,
  context: AuthContext | null = null
): Promise<Result<Booking, AppError>> {
  return getBookingService().cancel(id, body, context?.userId ?? null);
}

export async function ticketBookingHandler(
  id: string,
  context: AuthContext | null = null
): Promise<Result<Booking, AppError>> {
  return getBookingService().ticket(id, context?.userId ?? null);
}

export async function completeBookingHandler(
  id: string,
  context: AuthContext | null = null
): Promise<Result<Booking, AppError>> {
  return getBookingService().complete(id, context?.userId ?? null);
}
