export const AuditTimelineCategory = {
  MODULE_STATUS_CHANGE: "MODULE_STATUS_CHANGE",
  SLOW_QUERY: "SLOW_QUERY",
  ALERT_RAISED: "ALERT_RAISED",
} as const;

export type AuditTimelineCategory = (typeof AuditTimelineCategory)[keyof typeof AuditTimelineCategory];

/** A system-level (not business-data) audit trail — distinct from Auth's own `AuditLog`, which records user actions like login/permission-denied. This one records the observability platform's own findings about the system itself. */
export interface AuditTimelineEntry {
  id: string;
  timestamp: string;
  category: AuditTimelineCategory;
  message: string;
  details?: Record<string, unknown>;
}
