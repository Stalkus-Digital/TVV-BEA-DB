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
  const result = await getAuthService().register(body);
  return mapResult(result, toPublicUser);
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

export async function meHandler(context: AuthContext | null): Promise<Result<AuthContext, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return ok(context);
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
