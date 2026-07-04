import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import type { EmergencyContact } from "../types/customer-profile";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoDateString(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function validateEmergencyContact(input: unknown): Result<EmergencyContact | null, ValidationError> {
  if (input === undefined || input === null) return ok(null);
  if (typeof input !== "object") return err(new ValidationError("emergencyContact must be an object"));
  const body = input as Record<string, unknown>;
  if (!isNonEmptyString(body.name)) return err(new ValidationError("emergencyContact.name is required"));
  if (!isNonEmptyString(body.phone)) return err(new ValidationError("emergencyContact.phone is required"));
  if (body.relation !== undefined && body.relation !== null && typeof body.relation !== "string") {
    return err(new ValidationError("emergencyContact.relation must be a string"));
  }
  return ok({ name: body.name, phone: body.phone, relation: (body.relation as string | undefined) ?? null });
}

/** Every field is optional — this backs a PATCH, not a full replace. Only fields present in the body are validated/applied. */
export interface UpdateCustomerProfileInput {
  fullName?: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  passportNumber?: string | null;
  passportExpiry?: string | null;
  passportCountry?: string | null;
  emergencyContact?: EmergencyContact | null;
  preferences?: Record<string, unknown> | null;
}

export function validateUpdateCustomerProfile(input: unknown): Result<UpdateCustomerProfileInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;
  const output: UpdateCustomerProfileInput = {};

  if (body.fullName !== undefined) {
    if (!isNonEmptyString(body.fullName)) return err(new ValidationError("fullName must be a non-empty string"));
    output.fullName = body.fullName;
  }
  for (const field of ["phone", "nationality", "passportNumber", "passportCountry"] as const) {
    if (body[field] !== undefined) {
      if (body[field] !== null && typeof body[field] !== "string") return err(new ValidationError(`${field} must be a string or null`));
      output[field] = (body[field] as string | null) ?? null;
    }
  }
  for (const field of ["dateOfBirth", "passportExpiry"] as const) {
    if (body[field] !== undefined) {
      if (body[field] !== null && !isIsoDateString(body[field])) return err(new ValidationError(`${field} must be a valid date string or null`));
      output[field] = (body[field] as string | null) ?? null;
    }
  }
  if (body.emergencyContact !== undefined) {
    const emergencyContact = validateEmergencyContact(body.emergencyContact);
    if (!emergencyContact.ok) return emergencyContact;
    output.emergencyContact = emergencyContact.value;
  }
  if (body.preferences !== undefined) {
    if (body.preferences !== null && typeof body.preferences !== "object") {
      return err(new ValidationError("preferences must be an object or null"));
    }
    output.preferences = (body.preferences as Record<string, unknown> | null) ?? null;
  }

  return ok(output);
}

/** Backs `PATCH /api/me` — deliberately narrower than the profile update: name only, nothing else. */
export interface UpdateMeInput {
  fullName: string;
}

export function validateUpdateMe(input: unknown): Result<UpdateMeInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;
  if (!isNonEmptyString(body.fullName)) return err(new ValidationError("fullName must be a non-empty string"));
  return ok({ fullName: body.fullName });
}
