/**
 * Mirrors `lib/store/auth.ts`'s `CustomerUser` and the `{access_token, user}`
 * shape both `authActions.login()` and `authActions.register()` require —
 * confirmed against the frontend's own source, not inferred.
 */

/** What the frontend's register() call sends — `name`/`phone` have no Travel OS User field; see docs/30. */
export interface LegacyRegisterRequestBody {
  email?: unknown;
  password?: unknown;
  name?: unknown;
  phone?: unknown;
}

export interface LegacyCustomerUserDTO {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string | null;
}

/** `access_token`, not `accessToken` — the frontend reads this exact key. */
export interface LegacyLoginResponseDTO {
  access_token: string;
  user: LegacyCustomerUserDTO;
}
