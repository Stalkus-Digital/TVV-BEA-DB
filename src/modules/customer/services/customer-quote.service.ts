import { err, isErr, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import { getPackageService } from "@/modules/package";
import { getQuoteService, type Quote } from "@/modules/quote";
import { validateQuoteRequest } from "../validation/quote-request.validation";

const DEFAULT_VALIDITY_DAYS = 14;

function addDays(iso: string, days: number): string {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/**
 * Every method takes `customerId` as an explicit first argument, sourced
 * by the caller (customer/api handlers) only from the authenticated
 * session — never from a route param or request body. `getById` returns
 * NOT_FOUND, not FORBIDDEN, for a quote that exists but belongs to someone
 * else, so a customer can never learn another customer's quote even
 * exists.
 */
export class CustomerQuoteService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async list(customerId: string, pagination: PaginationParams = {}): Promise<Result<PaginatedResult<Quote>, AppError>> {
    return getQuoteService().list({ ...pagination, customerId });
  }

  async getById(customerId: string, id: string): Promise<Result<Quote, AppError>> {
    const result = await getQuoteService().getById(id);
    if (isErr(result)) return result;
    if (result.value.customerId !== customerId) return err(new NotFoundError(`Quote "${id}" not found`));
    return ok(result.value);
  }

  /**
   * Translates a simple customer-facing request into the Quote engine's
   * full `CreateQuoteInput` shape — currency/adjustments/validity stay
   * sales decisions, never customer-supplied. Quote starts DRAFT; a sales
   * agent must still approve it before any booking can be created (see
   * docs/32's Quote Request Flow diagram — no automatic booking).
   */
  async submitQuoteRequest(customerId: string, input: unknown): Promise<Result<Quote, AppError>> {
    const validated = validateQuoteRequest(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    const pkg = await getPackageService().getBySlug(value.packageSlug);
    if (isErr(pkg)) return pkg;

    const now = new Date().toISOString();
    this.logger.info("Customer submitting quote request", { customerId, packageSlug: value.packageSlug });
    return getQuoteService().create(
      {
        title: `Quote request — ${pkg.value.title}`,
        destinationId: pkg.value.destinationId,
        packageId: pkg.value.id,
        travelerDetails: value.travelerDetails,
        currency: "INR",
        adjustments: [],
        validFrom: now,
        validTo: addDays(now, DEFAULT_VALIDITY_DAYS),
        customerNotes: value.message,
      },
      customerId
    );
  }
}
