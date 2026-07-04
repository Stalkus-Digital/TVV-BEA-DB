import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import type { InsuranceDetails } from "../../types/kinds";

export function validateInsuranceDetails(input: unknown): Result<InsuranceDetails, ValidationError> {
  if (typeof input !== "object" || input === null) {
    return err(new ValidationError("Insurance details must be an object"));
  }
  const { providerName, coverageAmount, currencyCode, termDays, termsUrl } = input as Record<string, unknown>;

  if (typeof providerName !== "string" || providerName.trim().length === 0) {
    return err(new ValidationError("providerName is required"));
  }
  if (typeof coverageAmount !== "number" || coverageAmount <= 0) {
    return err(new ValidationError("coverageAmount must be a positive number"));
  }
  if (typeof currencyCode !== "string" || currencyCode.trim().length !== 3) {
    return err(new ValidationError("currencyCode must be a 3-letter code"));
  }
  if (typeof termDays !== "number" || termDays <= 0) {
    return err(new ValidationError("termDays must be a positive number"));
  }
  if (termsUrl !== undefined && typeof termsUrl !== "string") {
    return err(new ValidationError("termsUrl must be a string"));
  }

  return ok({
    providerName,
    coverageAmount,
    currencyCode: currencyCode.toUpperCase(),
    termDays,
    ...(termsUrl !== undefined ? { termsUrl: termsUrl as string } : {}),
  });
}
