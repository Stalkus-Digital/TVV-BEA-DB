import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export interface CreateApiKeyInput {
  name: string;
  roleId: string;
  expiresAt: string | null;
}

export function validateCreateApiKey(input: unknown): Result<CreateApiKeyInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  if (!isNonEmptyString(body.name)) return err(new ValidationError("name is required"));
  if (!isNonEmptyString(body.roleId)) return err(new ValidationError("roleId is required"));
  if (body.expiresAt !== undefined && body.expiresAt !== null) {
    if (typeof body.expiresAt !== "string" || Number.isNaN(new Date(body.expiresAt).getTime())) {
      return err(new ValidationError("expiresAt must be a valid ISO date string"));
    }
  }

  return ok({ name: body.name, roleId: body.roleId, expiresAt: (body.expiresAt as string | undefined) ?? null });
}
