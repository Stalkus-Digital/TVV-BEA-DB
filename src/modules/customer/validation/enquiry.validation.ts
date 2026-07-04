import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { EnquiryType } from "../types/enquiry";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

const VALID_TYPES: string[] = Object.values(EnquiryType);

export interface SubmitEnquiryInput {
  type: EnquiryType;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  destinationSlug: string | null;
  packageSlug: string | null;
  source: string | null;
}

/** Public endpoint — anonymous visitors submit these, so every field is validated defensively, nothing trusted. */
export function validateSubmitEnquiry(input: unknown): Result<SubmitEnquiryInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  const type = typeof body.type === "string" && VALID_TYPES.includes(body.type) ? (body.type as EnquiryType) : null;
  if (!type) return err(new ValidationError(`type must be one of: ${VALID_TYPES.join(", ")}`));

  if (!isNonEmptyString(body.name)) return err(new ValidationError("name is required"));
  if (!isNonEmptyString(body.email)) return err(new ValidationError("email is required"));

  for (const field of ["phone", "message", "destinationSlug", "packageSlug", "source"] as const) {
    if (body[field] !== undefined && body[field] !== null && typeof body[field] !== "string") {
      return err(new ValidationError(`${field} must be a string`));
    }
  }

  if (type === EnquiryType.DESTINATION && !isNonEmptyString(body.destinationSlug)) {
    return err(new ValidationError("destinationSlug is required for a DESTINATION enquiry"));
  }
  if (type === EnquiryType.PACKAGE && !isNonEmptyString(body.packageSlug)) {
    return err(new ValidationError("packageSlug is required for a PACKAGE enquiry"));
  }

  return ok({
    type,
    name: body.name,
    email: body.email,
    phone: (body.phone as string | undefined) ?? null,
    message: (body.message as string | undefined) ?? null,
    destinationSlug: (body.destinationSlug as string | undefined) ?? null,
    packageSlug: (body.packageSlug as string | undefined) ?? null,
    source: (body.source as string | undefined) ?? null,
  });
}
