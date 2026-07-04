/** Device/IP tracking live directly on the session record — captured once at login/refresh time, not a separate tracking table. */
export interface Session {
  id: string;
  userId: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  rememberMe: boolean;
  expiresAt: string;
  revokedAt: string | null;
  lastActivityAt: string;
  createdAt: string;
}
