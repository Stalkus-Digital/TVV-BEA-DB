import type { AppError } from "@/shared/errors";
import { ValidationError } from "@/shared/errors";
import { err, isErr, ok, type Result } from "@/shared/types";
import type { AuthContext } from "@/modules/auth";
import { callGetUserById, callLogin, callMe, callRegister, type LegacyRequestMeta } from "../adapters/auth.adapter";
import { toLegacyCustomerUser, toLegacyLoginResponse, toTravelOsRegisterInput } from "../transformers/auth.transformer";
import type { LegacyCustomerUserDTO, LegacyLoginResponseDTO } from "../dto/legacy-auth.dto";

export async function legacyLogin(body: unknown, meta: LegacyRequestMeta): Promise<Result<LegacyLoginResponseDTO, AppError>> {
  const result = await callLogin(body, meta);
  if (isErr(result)) return result;
  return ok(toLegacyLoginResponse(result.value));
}

/**
 * Travel OS's `register()` only creates the user and returns it (201, no
 * token) — the frontend's `authActions.register()` requires
 * `{access_token, user}` back, same shape as login. This composes the two
 * already-existing orchestrators (register, then login with the same
 * credentials) rather than reimplementing either one — no password
 * hashing or session logic lives here.
 */
export async function legacyRegister(body: unknown, meta: LegacyRequestMeta): Promise<Result<LegacyLoginResponseDTO, AppError>> {
  const registerResult = await callRegister(toTravelOsRegisterInput(body));
  if (isErr(registerResult)) return registerResult;

  if (typeof body !== "object" || body === null) {
    return err(new ValidationError("email and password are required"));
  }
  const { email, password } = body as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || typeof password !== "string") {
    return err(new ValidationError("email and password are required"));
  }

  const loginResult = await callLogin({ email, password }, meta);
  if (isErr(loginResult)) return loginResult;
  return ok(toLegacyLoginResponse(loginResult.value));
}

/** `AuthContext` alone has no `fullName` — fetches the full user record via the existing `getUserHandler` to fill `name`. */
export async function legacyMe(context: AuthContext | null): Promise<Result<LegacyCustomerUserDTO, AppError>> {
  const meResult = await callMe(context);
  if (isErr(meResult)) return meResult;

  const userResult = await callGetUserById(meResult.value.userId);
  const user = isErr(userResult) ? null : userResult.value;
  return ok(toLegacyCustomerUser(meResult.value, user));
}
