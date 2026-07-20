import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import type { AuthContext } from "@/modules/auth";
import { getTravellerService } from "../module";
import type { Traveller } from "../types/traveller";

export async function listTravellersHandler(bookingId: string): Promise<Result<Traveller[], AppError>> {
  return getTravellerService().listByBooking(bookingId);
}

export async function addTravellerHandler(
  bookingId: string,
  body: unknown,
  context: AuthContext | null = null
): Promise<Result<Traveller, AppError>> {
  return getTravellerService().add(bookingId, body, context?.userId ?? null);
}

export async function updateTravellerHandler(
  bookingId: string,
  travellerId: string,
  body: unknown,
  context: AuthContext | null = null
): Promise<Result<Traveller, AppError>> {
  return getTravellerService().update(bookingId, travellerId, body, context?.userId ?? null);
}

export async function removeTravellerHandler(
  bookingId: string,
  travellerId: string,
  context: AuthContext | null = null
): Promise<Result<void, AppError>> {
  return getTravellerService().remove(bookingId, travellerId, context?.userId ?? null);
}
