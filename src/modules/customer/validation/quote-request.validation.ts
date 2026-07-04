import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import type { LeadTraveler, TravelerDetails } from "@/modules/quote";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Quote's own `validateTravelerDetails` isn't part of its public surface
 * (only types/api/service-accessors are exported, per every module's
 * boundary discipline in this project) — this is a small, deliberate,
 * local re-validation of the same shape, not a shortcut.
 */
function validateLeadTraveler(input: unknown): Result<LeadTraveler, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("travelerDetails.leadTraveler must be an object"));
  const body = input as Record<string, unknown>;
  if (!isNonEmptyString(body.name)) return err(new ValidationError("travelerDetails.leadTraveler.name is required"));
  if (!isNonEmptyString(body.email)) return err(new ValidationError("travelerDetails.leadTraveler.email is required"));
  if (body.phone !== undefined && body.phone !== null && typeof body.phone !== "string") {
    return err(new ValidationError("travelerDetails.leadTraveler.phone must be a string"));
  }
  return ok({ name: body.name, email: body.email, phone: (body.phone as string | undefined) ?? null });
}

function validateTravelerDetails(input: unknown): Result<TravelerDetails, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("travelerDetails must be an object"));
  const body = input as Record<string, unknown>;

  const leadTraveler = validateLeadTraveler(body.leadTraveler);
  if (!leadTraveler.ok) return leadTraveler;

  const adults = typeof body.adults === "number" && body.adults > 0 ? body.adults : null;
  if (!adults) return err(new ValidationError("travelerDetails.adults must be a positive number"));

  for (const field of ["children", "infants"] as const) {
    if (body[field] !== undefined && (typeof body[field] !== "number" || (body[field] as number) < 0)) {
      return err(new ValidationError(`travelerDetails.${field} must be a non-negative number`));
    }
  }

  return ok({
    leadTraveler: leadTraveler.value,
    adults,
    children: (body.children as number | undefined) ?? 0,
    infants: (body.infants as number | undefined) ?? 0,
  });
}

/**
 * Deliberately narrower than Quote's own `CreateQuoteInput` — a customer
 * requests a quote against a package they're viewing; they never set
 * currency, adjustments, or validity dates themselves (those stay sales
 * decisions). `CustomerQuoteService.submitQuoteRequest()` fills in the
 * rest before calling the Quote engine.
 *
 * `packageSlug`, not `packageId` — the public Website API only ever
 * exposes packages by slug (`/api/website/package/:slug`); a customer
 * browsing the site has no way to know a package's internal id.
 * `CustomerQuoteService` resolves the slug to an id via
 * `getPackageService().getBySlug()` before calling the Quote engine.
 */
export interface QuoteRequestInput {
  packageSlug: string;
  travelerDetails: TravelerDetails;
  message: string | null;
}

export function validateQuoteRequest(input: unknown): Result<QuoteRequestInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  if (!isNonEmptyString(body.packageSlug)) return err(new ValidationError("packageSlug is required"));

  const travelerDetails = validateTravelerDetails(body.travelerDetails);
  if (!travelerDetails.ok) return travelerDetails;

  if (body.message !== undefined && body.message !== null && typeof body.message !== "string") {
    return err(new ValidationError("message must be a string"));
  }

  return ok({
    packageSlug: body.packageSlug,
    travelerDetails: travelerDetails.value,
    message: (body.message as string | undefined) ?? null,
  });
}
