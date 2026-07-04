import { err, isErr, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import { getBookingService, type Booking } from "@/modules/booking";

/**
 * Same ownership discipline as `CustomerQuoteService`: `customerId` is
 * always an explicit argument sourced from the authenticated session, and
 * a booking that exists but belongs to someone else returns NOT_FOUND, not
 * FORBIDDEN. There is no "submit a booking request" here — Bookings are
 * only ever created from an approved Quote by staff (`BookingService
 * .createFromQuote()`), per this sprint's explicit "No automatic booking."
 */
export class CustomerBookingService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async list(customerId: string, pagination: PaginationParams = {}): Promise<Result<PaginatedResult<Booking>, AppError>> {
    return getBookingService().list({ ...pagination, customerId });
  }

  async getById(customerId: string, id: string): Promise<Result<Booking, AppError>> {
    const result = await getBookingService().getById(id);
    if (isErr(result)) return result;
    if (result.value.customerId !== customerId) return err(new NotFoundError(`Booking "${id}" not found`));
    return ok(result.value);
  }
}
