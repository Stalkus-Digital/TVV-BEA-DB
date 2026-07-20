import { err, isErr, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import { getBookingService, type Booking } from "@/modules/booking";
import { getDestinationService } from "@/modules/destination";
import { getPackageService } from "@/modules/package";

/**
 * CUSTOMER-001: fills in `destinationName`/`productLabel` for the customer
 * dashboard — the raw Booking only carries `destinationId`/`packageId`,
 * which meant a customer's own "My Bookings" list showed nothing but a
 * booking number. Resolves each booking's destination and, for the product
 * label, prefers the first BookingItem's title (works for HOTEL/ACTIVITY
 * bookings, which have no packageId) and falls back to the linked
 * Package's title, then the booking number if neither exists.
 */
async function enrich(booking: Booking): Promise<Booking> {
  const [destination, pkg] = await Promise.all([
    getDestinationService().getById(booking.destinationId),
    booking.packageId ? getPackageService().getById(booking.packageId) : Promise.resolve(null),
  ]);

  const itemLabel = booking.items?.[0]?.title;
  const packageLabel = pkg && !isErr(pkg) ? pkg.value.title : undefined;

  return {
    ...booking,
    destinationName: !isErr(destination) ? destination.value.name : null,
    productLabel: itemLabel ?? packageLabel ?? booking.bookingNumber,
  };
}

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
    const result = await getBookingService().list({ ...pagination, customerId });
    if (isErr(result)) return result;
    const items = await Promise.all(result.value.items.map(enrich));
    return ok({ ...result.value, items });
  }

  async getById(customerId: string, id: string): Promise<Result<Booking, AppError>> {
    const result = await getBookingService().getById(id);
    if (isErr(result)) return result;
    if (result.value.customerId !== customerId) return err(new NotFoundError(`Booking "${id}" not found`));
    return ok(await enrich(result.value));
  }
}
