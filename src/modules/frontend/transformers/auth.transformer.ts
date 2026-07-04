import type { AuthContext, PublicUser } from "@/modules/auth";
import type { LegacyCustomerUserDTO, LegacyLoginResponseDTO, LegacyRegisterRequestBody } from "../dto/legacy-auth.dto";

/** `LoginResult` itself isn't part of `@/modules/auth`'s public surface (defined in the internal auth.service.ts) — this local, structurally-identical shape avoids reaching into module internals for one type. */
export interface TravelOsLoginResult {
  accessToken: string;
  user: { id: string; email: string; fullName: string };
  roles: string[];
}

/**
 * Structural rename only (`name` → `fullName`), not validation —
 * `AuthService.register()`'s own `validateRegister()` still owns every
 * actual field-format check. `phone` has no Travel OS `User` field at all
 * (confirmed by reading the schema) — silently dropped, not stored, not
 * fabricated. Non-object bodies pass through unchanged so the backend's
 * own validation still rejects them with its normal error shape.
 */
export function toTravelOsRegisterInput(body: unknown): unknown {
  if (typeof body !== "object" || body === null) return body;
  const { name, phone: _phone, ...rest } = body as LegacyRegisterRequestBody;
  return { ...rest, fullName: name };
}

/**
 * `LoginResult` → `{access_token, user}` — the exact shape
 * `authActions.login()`/`register()` require. `phone` is always `null`
 * (no backend field). `role` takes the first of Travel OS's `roles[]`
 * since the frontend's `CustomerUser.role` is singular — self-registered
 * customers only ever hold one role (`CUSTOMER`) today, so this is a safe
 * simplification, not a lossy one, for the accounts this endpoint serves.
 */
export function toLegacyLoginResponse(result: TravelOsLoginResult): LegacyLoginResponseDTO {
  return {
    access_token: result.accessToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.fullName,
      phone: null,
      role: result.roles[0] ?? null,
    },
  };
}

/**
 * `/api/auth/me` returns `AuthContext` (no `fullName`, no `phone`) — the
 * fuller `PublicUser` record (fetched separately via the existing
 * `getUserHandler`) supplies `name`; `phone` stays `null` regardless, same
 * reason as above.
 */
export function toLegacyCustomerUser(context: AuthContext, user: PublicUser | null): LegacyCustomerUserDTO {
  return {
    id: context.userId,
    email: context.email,
    name: user?.fullName ?? null,
    phone: null,
    role: context.roles[0] ?? null,
  };
}
