import { getUserHandler, loginHandler, meHandler, registerHandler, type AuthContext } from "@/modules/auth";

/** `RequestMeta` itself isn't part of `@/modules/auth`'s public surface (only its DTO folder, not re-exported) — this local, structurally-identical shape avoids reaching into module internals for a two-field type. */
export interface LegacyRequestMeta {
  ipAddress: string | null;
  deviceInfo: string | null;
}

/**
 * Thin pass-through to the Auth module's own handlers — the same
 * `registerHandler`/`loginHandler`/`meHandler`/`getUserHandler` every
 * `/api/auth/*` route already calls. No password hashing, session
 * creation, or validation logic is reimplemented here.
 */
export function callRegister(body: unknown) {
  return registerHandler(body);
}

export function callLogin(body: unknown, meta: LegacyRequestMeta) {
  return loginHandler(body, meta);
}

export function callMe(context: AuthContext | null) {
  return meHandler(context);
}

export function callGetUserById(id: string) {
  return getUserHandler(id);
}
