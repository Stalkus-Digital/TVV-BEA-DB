import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { VisaEntryType, VisaType, type VisaDetails } from "../../types/kinds";

export function validateVisaDetails(input: unknown): Result<VisaDetails, ValidationError> {
  if (typeof input !== "object" || input === null) {
    return err(new ValidationError("Visa details must be an object"));
  }
  const { countryId, visaType, entryType, processingDays, validityDays, requiredDocuments } =
    input as Record<string, unknown>;

  if (typeof countryId !== "string" || countryId.trim().length === 0) {
    return err(new ValidationError("countryId is required"));
  }
  const validTypes = Object.values(VisaType) as string[];
  if (typeof visaType !== "string" || !validTypes.includes(visaType)) {
    return err(new ValidationError(`visaType must be one of: ${validTypes.join(", ")}`));
  }
  const validEntryTypes = Object.values(VisaEntryType) as string[];
  if (typeof entryType !== "string" || !validEntryTypes.includes(entryType)) {
    return err(new ValidationError(`entryType must be one of: ${validEntryTypes.join(", ")}`));
  }
  if (typeof processingDays !== "number" || processingDays < 0) {
    return err(new ValidationError("processingDays must be a non-negative number"));
  }
  if (typeof validityDays !== "number" || validityDays <= 0) {
    return err(new ValidationError("validityDays must be a positive number"));
  }
  if (!Array.isArray(requiredDocuments) || !requiredDocuments.every((d) => typeof d === "string")) {
    return err(new ValidationError("requiredDocuments must be an array of strings"));
  }

  return ok({
    countryId,
    visaType: visaType as VisaDetails["visaType"],
    entryType: entryType as VisaDetails["entryType"],
    processingDays,
    validityDays,
    requiredDocuments: requiredDocuments as string[],
  });
}
