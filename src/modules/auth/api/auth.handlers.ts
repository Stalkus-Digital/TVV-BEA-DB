import type { AppError } from "@/shared/errors";
import { err, mapResult, ok, type Result } from "@/shared/types";
import { UnauthorizedError } from "@/shared/errors";
import { ensureAuthModuleSeeded, getAuthService } from "../module";
import type { LoginResult, RequestContext } from "../services/auth.service";
import type { AuthContext } from "../types/auth-context";
import type { RequestMeta } from "./dto";
import { toPublicUser, type PublicUser } from "./user.transformer";

function toRequestContext(meta: RequestMeta): RequestContext {
  return { ipAddress: meta.ipAddress, deviceInfo: meta.deviceInfo };
}

export async function registerHandler(body: unknown): Promise<Result<PublicUser, AppError>> {
  await ensureAuthModuleSeeded();

  const recaptchaToken =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).recaptchaToken
      : undefined;
  const { verifyRecaptchaToken } = await import("@/modules/integrations/services/recaptcha.service");
  const captcha = await verifyRecaptchaToken(recaptchaToken);
  if (!captcha.ok) return captcha;

  const result = await getAuthService().register(body);
  if (!result.ok) return result;

  // Eager CustomerProfile so website signups appear in admin Customers immediately.
  // Dynamic import avoids a hard auth ↔ customer module cycle at load time.
  const { getCustomerProfileService } = await import("@/modules/customer");
  await getCustomerProfileService().updateFullProfile(result.value.id, {});

  return mapResult(ok(result.value), toPublicUser);
}

export async function loginHandler(body: unknown, meta: RequestMeta): Promise<Result<LoginResult, AppError>> {
  await ensureAuthModuleSeeded();
  return getAuthService().login(body, toRequestContext(meta));
}

export async function logoutHandler(context: AuthContext | null): Promise<Result<void, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getAuthService().logout(context.sessionId, context.userId);
}

export async function refreshHandler(body: unknown, meta: RequestMeta): Promise<Result<LoginResult, AppError>> {
  await ensureAuthModuleSeeded();
  if (typeof body !== "object" || body === null || typeof (body as Record<string, unknown>).refreshToken !== "string") {
    return err(new UnauthorizedError("refreshToken is required"));
  }
  return getAuthService().refresh((body as Record<string, string>).refreshToken, toRequestContext(meta));
}

export interface MeResponse extends AuthContext {
  fullName: string;
  emailVerified: boolean;
}

export async function meHandler(context: AuthContext | null): Promise<Result<MeResponse, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  const profile = await getAuthService().getMeProfile(context.userId);
  if (!profile.ok) return profile;
  return ok({
    ...context,
    fullName: profile.value.fullName,
    emailVerified: profile.value.emailVerified,
  });
}

export async function changePasswordHandler(context: AuthContext | null, body: unknown): Promise<Result<void, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getAuthService().changePassword(context.userId, body);
}

export async function requestPasswordResetHandler(body: unknown): Promise<Result<void, AppError>> {
  await ensureAuthModuleSeeded();
  return getAuthService().requestPasswordReset(body);
}

export async function resetPasswordHandler(body: unknown): Promise<Result<void, AppError>> {
  return getAuthService().resetPassword(body);
}

export async function verifyEmailHandler(body: unknown): Promise<Result<{ email: string }, AppError>> {
  await ensureAuthModuleSeeded();
  return getAuthService().verifyEmail(body);
}

export async function resendVerificationHandler(body: unknown): Promise<Result<void, AppError>> {
  await ensureAuthModuleSeeded();
  return getAuthService().resendVerification(body);
}
