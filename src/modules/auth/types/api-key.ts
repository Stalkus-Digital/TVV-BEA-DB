/**
 * Machine-to-machine access (the API role) — same selector/validator
 * pattern as RefreshToken/PasswordReset for keyHash. keyPrefix is the only
 * part of the raw key ever shown again after creation (e.g. "tvv_live_a1b2"),
 * for the caller to identify which key is which without re-exposing the
 * secret.
 */
export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  roleId: string;
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}
