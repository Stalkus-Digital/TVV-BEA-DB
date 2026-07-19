/** Same selector/validator pattern as PasswordReset — tokenHash never stores the raw verification token. */
export interface EmailVerification {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}
