import type { AppError } from "@/shared/errors";
import type { PaginatedResult, Result } from "@/shared/types";
import { getBookingService } from "../module";
import type { Booking } from "../types/booking";
import type { ListBookingsQuery } from "./dto";

export async function listBookingsHandler(query: ListBookingsQuery): Promise<Result<PaginatedResult<Booking>, AppError>> {
  return getBookingService().list(query);
}

export async function getBookingHandler(id: string): Promise<Result<Booking, AppError>> {
  return getBookingService().getById(id);
}

export async function createBookingHandler(body: unknown): Promise<Result<Booking, AppError>> {
  return getBookingService().createFromQuote(body);
}

export async function updateBookingHandler(id: string, body: unknown): Promise<Result<Booking, AppError>> {
  return getBookingService().update(id, body);
}

export async function confirmBookingHandler(id: string): Promise<Result<Booking, AppError>> {
  return getBookingService().confirm(id);
}

export async function cancelBookingHandler(id: string, body: unknown): Promise<Result<Booking, AppError>> {
  return getBookingService().cancel(id, body);
}

export async function ticketBookingHandler(id: string): Promise<Result<Booking, AppError>> {
  return getBookingService().ticket(id);
}

export async function completeBookingHandler(id: string): Promise<Result<Booking, AppError>> {
  return getBookingService().complete(id);
}
