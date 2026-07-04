import { ModuleStatus, type ModuleStatusReport } from "../types/module-status";
import type { SlowQueryEntry } from "../types/slow-query";
import { AlertSeverity, type Alert } from "../types/alert";

const CRITICAL_QUERY_DURATION_MS = 1000;

/**
 * Pure evaluation — no side effects, no external calls (this sprint's
 * "use internal abstractions only": no Sentry/Datadog/Slack paging exists
 * to call anyway). `alert.service.ts` is the thin wrapper that feeds this
 * live dashboard data; kept separate so this rule set can be unit tested
 * without constructing any service.
 */
export function evaluateAlerts(statuses: ModuleStatusReport[], slowQueries: SlowQueryEntry[]): Alert[] {
  const alerts: Alert[] = [];

  for (const report of statuses) {
    if (report.status === ModuleStatus.OFFLINE) {
      alerts.push({
        severity: AlertSeverity.CRITICAL,
        source: report.name,
        message: `Module "${report.name}" is OFFLINE`,
        triggeredAt: new Date().toISOString(),
      });
    } else if (report.status === ModuleStatus.DEGRADED) {
      alerts.push({
        severity: AlertSeverity.WARNING,
        source: report.name,
        message: `Module "${report.name}" is DEGRADED`,
        triggeredAt: new Date().toISOString(),
      });
    } else if (report.status === ModuleStatus.WARNING) {
      alerts.push({
        severity: AlertSeverity.WARNING,
        source: report.name,
        message: `Module "${report.name}" latency is elevated (${report.latencyMs.toFixed(1)}ms)`,
        triggeredAt: new Date().toISOString(),
      });
    }
  }

  for (const query of slowQueries) {
    if (query.durationMs >= CRITICAL_QUERY_DURATION_MS) {
      alerts.push({
        severity: AlertSeverity.CRITICAL,
        source: "database",
        message: `Query took ${query.durationMs.toFixed(1)}ms (>= ${CRITICAL_QUERY_DURATION_MS}ms)`,
        triggeredAt: query.timestamp,
      });
    }
  }

  return alerts;
}

export { CRITICAL_QUERY_DURATION_MS };
