import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export interface CreateAdminCustomerInput {
  email: string;
  fullName: string;
  phone?: string | null;
}

export interface UpdateAdminCustomerInput {
  fullName?: string;
  phone?: string | null;
  isActive?: boolean;
}

export interface AdminCustomerNoteInput {
  body: string;
}

export interface ListAdminCustomersQuery {
  search?: string;
  emailVerified?: "all" | "verified" | "unverified";
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export function validateCreateAdminCustomer(input: unknown): Result<CreateAdminCustomerInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;
  if (!isNonEmptyString(body.email)) return err(new ValidationError("email is required"));
  if (!isNonEmptyString(body.fullName)) return err(new ValidationError("fullName is required"));
  if (body.phone !== undefined && body.phone !== null && typeof body.phone !== "string") {
    return err(new ValidationError("phone must be a string or null"));
  }
  return ok({
    email: body.email.trim(),
    fullName: body.fullName.trim(),
    phone: (body.phone as string | undefined)?.trim() ?? null,
  });
}

export function validateUpdateAdminCustomer(input: unknown): Result<UpdateAdminCustomerInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;
  const output: UpdateAdminCustomerInput = {};

  if (body.fullName !== undefined) {
    if (!isNonEmptyString(body.fullName)) return err(new ValidationError("fullName must be a non-empty string"));
    output.fullName = body.fullName.trim();
  }
  if (body.phone !== undefined) {
    if (body.phone !== null && typeof body.phone !== "string") return err(new ValidationError("phone must be a string or null"));
    output.phone = body.phone?.trim() ?? null;
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") return err(new ValidationError("isActive must be a boolean"));
    output.isActive = body.isActive;
  }

  if (Object.keys(output).length === 0) return err(new ValidationError("At least one field must be provided"));
  return ok(output);
}

export function validateAdminCustomerNoteBody(input: unknown): Result<AdminCustomerNoteInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { body } = input as Record<string, unknown>;
  if (!isNonEmptyString(body)) return err(new ValidationError("body is required"));
  return ok({ body: body.trim() });
}

export function validateBulkArchiveCustomers(input: unknown): Result<{ ids: string[] }, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const ids = (input as Record<string, unknown>).ids;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === "string")) {
    return err(new ValidationError("ids must be a non-empty array of strings"));
  }
  return ok({ ids });
}
