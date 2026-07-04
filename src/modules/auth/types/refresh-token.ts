/**
 * Selector/validator pattern: the id (selector) is looked up directly, and
 * tokenHash is the SHA-256 of the validator secret the client actually
 * holds — verified via a timing-safe comparison, never a Map-scan-by-hash.
 * replacedByTokenId chains rotations so reuse of an already-rotated-out
 * token is detectable (see services/auth.service.ts's refresh() — reuse
 * revokes the entire chain, a standard refresh-token-theft mitigation).
 */
export interface RefreshToken {
  id: string;
  userId: string;
  sessionId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
  replacedByTokenId: string | null;
  createdAt: string;
}
