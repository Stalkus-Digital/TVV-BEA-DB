import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getTravellerService } from "../module";
import type { Traveller } from "../types/traveller";

export async function listTravellersHandler(bookingId: string): Promise<Result<Traveller[], AppError>> {
  return getTravellerService().listByBooking(bookingId);
}

export async function addTravellerHandler(bookingId: string, body: unknown): Promise<Result<Traveller, AppError>> {
  return getTravellerService().add(bookingId, body);
}

export async function removeTravellerHandler(bookingId: string, travellerId: string): Promise<Result<void, AppError>> {
  return getTravellerService().remove(bookingId, travellerId);
}
