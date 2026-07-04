import { err, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { UnauthorizedError, type AppError } from "@/shared/errors";
import type { AuthContext } from "@/modules/auth";
import type { Booking } from "@/modules/booking";
import { getCustomerBookingService } from "../module";

export async function listMyBookingsHandler(context: AuthContext | null, pagination: PaginationParams): Promise<Result<PaginatedResult<Booking>, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getCustomerBookingService().list(context.userId, pagination);
}

export async function getMyBookingHandler(context: AuthContext | null, id: string): Promise<Result<Booking, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getCustomerBookingService().getById(context.userId, id);
}
