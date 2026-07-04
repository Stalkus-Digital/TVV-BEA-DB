import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value: unknown): Result<string, ValidationError> {
  if (!isNonEmptyString(value) || !EMAIL_PATTERN.test(value)) return err(new ValidationError("A valid email is required"));
  return ok(value.toLowerCase());
}

/** Minimum bar only — length + at least one letter and one digit. Not a full password-strength policy (out of scope this sprint, flagged in docs/22). */
function validatePassword(value: unknown, field = "password"): Result<string, ValidationError> {
  if (!isNonEmptyString(value)) return err(new ValidationError(`${field} is required`));
  if (value.length < 8) return err(new ValidationError(`${field} must be at least 8 characters`));
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) return err(new ValidationError(`${field} must contain at least one letter and one digit`));
  return ok(value);
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function validateLogin(input: unknown): Result<LoginInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  const email = validateEmail(body.email);
  if (!email.ok) return email;
  if (!isNonEmptyString(body.password)) return err(new ValidationError("password is required"));
  if (body.rememberMe !== undefined && typeof body.rememberMe !== "boolean") return err(new ValidationError("rememberMe must be a boolean"));

  return ok({ email: email.value, password: body.password, rememberMe: (body.rememberMe as boolean | undefined) ?? false });
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}

export function validateRegister(input: unknown): Result<RegisterInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  const email = validateEmail(body.email);
  if (!email.ok) return email;
  const password = validatePassword(body.password);
  if (!password.ok) return password;
  if (!isNonEmptyString(body.fullName)) return err(new ValidationError("fullName is required"));

  return ok({ email: email.value, password: password.value, fullName: body.fullName });
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function validateChangePassword(input: unknown): Result<ChangePasswordInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  if (!isNonEmptyString(body.currentPassword)) return err(new ValidationError("currentPassword is required"));
  const newPassword = validatePassword(body.newPassword, "newPassword");
  if (!newPassword.ok) return newPassword;

  return ok({ currentPassword: body.currentPassword, newPassword: newPassword.value });
}

export interface RefreshInput {
  refreshToken: string;
}

export function validateRefresh(input: unknown): Result<RefreshInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const { refreshToken } = input as Record<string, unknown>;
  if (!isNonEmptyString(refreshToken)) return err(new ValidationError("refreshToken is required"));
  return ok({ refreshToken });
}

export interface RequestPasswordResetInput {
  email: string;
}

export function validateRequestPasswordReset(input: unknown): Result<RequestPasswordResetInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const email = validateEmail((input as Record<string, unknown>).email);
  if (!email.ok) return email;
  return ok({ email: email.value });
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export function validateResetPassword(input: unknown): Result<ResetPasswordInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  if (!isNonEmptyString(body.token)) return err(new ValidationError("token is required"));
  const newPassword = validatePassword(body.newPassword, "newPassword");
  if (!newPassword.ok) return newPassword;

  return ok({ token: body.token, newPassword: newPassword.value });
}
