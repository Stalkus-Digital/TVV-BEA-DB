export const AlertSeverity = {
  WARNING: "WARNING",
  CRITICAL: "CRITICAL",
} as const;

export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity];

/** Internal-only — surfaced via `/api/system/metrics`, never paged/emailed/posted anywhere (this sprint explicitly rules out Sentry/Datadog/Grafana/Prometheus integrations). */
export interface Alert {
  severity: AlertSeverity;
  source: string;
  message: string;
  triggeredAt: string;
}
