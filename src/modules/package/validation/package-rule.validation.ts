import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import type { BookingWindow, CancellationTier, PaymentTerms } from "../types/package-rule";

export interface UpdateRuleInput {
  cancellationTiers: CancellationTier[];
  paymentTerms: PaymentTerms | null;
  refundPolicy: string | null;
  bookingWindow: BookingWindow | null;
  minPax: number;
  maxPax: number | null;
}

export function validateUpdateRule(input: unknown): Result<UpdateRuleInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  if (body.cancellationTiers !== undefined) {
    if (
      !Array.isArray(body.cancellationTiers) ||
      !body.cancellationTiers.every(
        (t) =>
          typeof t === "object" &&
          t !== null &&
          typeof (t as CancellationTier).daysBeforeDeparture === "number" &&
          typeof (t as CancellationTier).refundPercentage === "number"
      )
    ) {
      return err(new ValidationError("cancellationTiers must be an array of { daysBeforeDeparture, refundPercentage }"));
    }
  }

  if (typeof body.minPax !== "number" || body.minPax < 1) {
    return err(new ValidationError("minPax must be at least 1"));
  }
  if (body.maxPax !== undefined && body.maxPax !== null) {
    if (typeof body.maxPax !== "number" || body.maxPax < body.minPax) {
      return err(new ValidationError("maxPax must be a number greater than or equal to minPax"));
    }
  }

  return ok({
    cancellationTiers: (body.cancellationTiers as CancellationTier[] | undefined) ?? [],
    paymentTerms: (body.paymentTerms as PaymentTerms | null | undefined) ?? null,
    refundPolicy: (body.refundPolicy as string | null | undefined) ?? null,
    bookingWindow: (body.bookingWindow as BookingWindow | null | undefined) ?? null,
    minPax: body.minPax,
    maxPax: (body.maxPax as number | null | undefined) ?? null,
  });
}

export interface EvaluateRuleInput {
  paxCount: number;
  travelDate: string;
  bookingDate?: string;
}

export function validateEvaluateRuleRequest(input: unknown): Result<EvaluateRuleInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { paxCount, travelDate, bookingDate } = input as Record<string, unknown>;

  if (typeof paxCount !== "number" || paxCount <= 0) return err(new ValidationError("paxCount must be a positive number"));
  if (typeof travelDate !== "string" || Number.isNaN(Date.parse(travelDate))) {
    return err(new ValidationError("travelDate must be a valid date string"));
  }
  if (bookingDate !== undefined && (typeof bookingDate !== "string" || Number.isNaN(Date.parse(bookingDate)))) {
    return err(new ValidationError("bookingDate must be a valid date string"));
  }

  return ok({ paxCount, travelDate, bookingDate: bookingDate as string | undefined });
}
