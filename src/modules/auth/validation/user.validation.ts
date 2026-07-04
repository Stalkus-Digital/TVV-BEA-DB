import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export interface UpdateUserInput {
  fullName?: string;
  isActive?: boolean;
}

export function validateUpdateUser(input: unknown): Result<UpdateUserInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;
  const output: UpdateUserInput = {};

  if (body.fullName !== undefined) {
    if (!isNonEmptyString(body.fullName)) return err(new ValidationError("fullName must be a non-empty string"));
    output.fullName = body.fullName;
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") return err(new ValidationError("isActive must be a boolean"));
    output.isActive = body.isActive;
  }

  return ok(output);
}

export interface AssignRoleInput {
  roleId: string;
}

export function validateAssignRole(input: unknown): Result<AssignRoleInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { roleId } = input as Record<string, unknown>;
  if (!isNonEmptyString(roleId)) return err(new ValidationError("roleId is required"));
  return ok({ roleId });
}
