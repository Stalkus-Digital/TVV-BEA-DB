/**
 * passwordHash is always "salt:hash" hex (see services/password.ts) — never
 * a raw password, never a reversible encoding. failedLoginAttempts/
 * lockedUntil implement the account-lock requirement directly on User
 * rather than a separate table, matching this project's precedent of
 * embedding small always-accessed-with-parent state on the owning entity
 * (Destination.seo, Package.faqs) rather than a needless join.
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}
