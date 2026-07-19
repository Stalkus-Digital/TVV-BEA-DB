/**
 * The original 7 event types are per this sprint's brief.
 * INTEGRATION_CONFIG_CHANGED was added for SEC-001 (Integration Vault
 * Hardening) — the vault had zero audit trail for who changed a stored
 * credential or provider status; `details` never includes the secret
 * value itself, only the provider key and which field names changed.
 */
export const AuditEventType = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  FAILED_LOGIN: "FAILED_LOGIN",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  PASSWORD_RESET: "PASSWORD_RESET",
  USER_CREATED: "USER_CREATED",
  ROLE_CHANGED: "ROLE_CHANGED",
  INTEGRATION_CONFIG_CHANGED: "INTEGRATION_CONFIG_CHANGED",
} as const;

export type AuditEventType = (typeof AuditEventType)[keyof typeof AuditEventType];

/** actorUserId is who performed the action (null for a pre-auth failed login attempt); targetUserId is who it was done to, when different from the actor (e.g. an admin changing someone else's role). */
export interface AuditLog {
  id: string;
  eventType: AuditEventType;
  actorUserId: string | null;
  targetUserId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  occurredAt: string;
}
