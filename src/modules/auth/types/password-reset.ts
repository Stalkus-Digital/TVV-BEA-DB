/** Same selector/validator pattern as RefreshToken — tokenHash never stores the raw reset token. */
export interface PasswordReset {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}
