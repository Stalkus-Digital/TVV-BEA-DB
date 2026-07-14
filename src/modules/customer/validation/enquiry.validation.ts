import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { EnquiryStatus, EnquiryType } from "../types/enquiry";

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
  hotelSlug: string | null;
  activitySlug: string | null;
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

  for (const field of ["phone", "message", "destinationSlug", "packageSlug", "hotelSlug", "activitySlug", "source"] as const) {
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
  if (type === EnquiryType.HOTEL && !isNonEmptyString(body.hotelSlug)) {
    return err(new ValidationError("hotelSlug is required for a HOTEL enquiry"));
  }
  if (type === EnquiryType.ACTIVITY && !isNonEmptyString(body.activitySlug)) {
    return err(new ValidationError("activitySlug is required for an ACTIVITY enquiry"));
  }

  return ok({
    type,
    name: body.name,
    email: body.email,
    phone: (body.phone as string | undefined) ?? null,
    message: (body.message as string | undefined) ?? null,
    destinationSlug: (body.destinationSlug as string | undefined) ?? null,
    packageSlug: (body.packageSlug as string | undefined) ?? null,
    hotelSlug: (body.hotelSlug as string | undefined) ?? null,
    activitySlug: (body.activitySlug as string | undefined) ?? null,
    source: (body.source as string | undefined) ?? null,
  });
}

const VALID_STATUSES: string[] = Object.values(EnquiryStatus);

export interface UpdateEnquiryStatusInput {
  status: EnquiryStatus;
}

export function validateUpdateEnquiryStatus(input: unknown): Result<UpdateEnquiryStatusInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const status = typeof (input as Record<string, unknown>).status === "string" && VALID_STATUSES.includes((input as Record<string, unknown>).status as string)
    ? ((input as Record<string, unknown>).status as EnquiryStatus)
    : null;
  if (!status) return err(new ValidationError(`status must be one of: ${VALID_STATUSES.join(", ")}`));
  return ok({ status });
}

export interface AssignEnquiryInput {
  assignedToUserId: string | null;
}

export function validateAssignEnquiry(input: unknown): Result<AssignEnquiryInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { assignedToUserId } = input as Record<string, unknown>;
  if (assignedToUserId === null || assignedToUserId === undefined) return ok({ assignedToUserId: null });
  if (typeof assignedToUserId !== "string" || assignedToUserId.trim().length === 0) {
    return err(new ValidationError("assignedToUserId must be a non-empty string or null"));
  }
  return ok({ assignedToUserId });
}

export interface EnquiryNoteInput {
  body: string;
}

export function validateEnquiryNoteBody(input: unknown): Result<EnquiryNoteInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { body } = input as Record<string, unknown>;
  if (!isNonEmptyString(body)) return err(new ValidationError("body is required"));
  return ok({ body });
}
