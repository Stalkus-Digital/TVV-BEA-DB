/** Exactly the 7 event types named in this sprint's brief. */
export const AuditEventType = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  FAILED_LOGIN: "FAILED_LOGIN",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  PASSWORD_RESET: "PASSWORD_RESET",
  USER_CREATED: "USER_CREATED",
  ROLE_CHANGED: "ROLE_CHANGED",
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
