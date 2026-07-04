import { err, ok, type Result } from "@/shared/types";
import { ValidationError, type AppError } from "@/shared/errors";
import type { LogLevel } from "@/shared/logger";
import { getAlertService, getAuditTimelineService, getSystemDashboardService } from "../module";
import { logStore } from "../logging/log-store";
import { metricsRegistry } from "../metrics/metrics-registry";
import { slowQueryTracker } from "../performance/slow-query-tracker";
import { getSystemVersion } from "../dashboard/system-version.service";
import type { CapturedLogEntry } from "../types/log-entry";
import type { ModuleStatusReport } from "../types/module-status";
import type { SystemVersionInfo } from "../types/system-version";
import type { Alert } from "../types/alert";
import type { AuditTimelineEntry } from "../types/audit-timeline-entry";
import type { MetricsSnapshot } from "../types/metric";
import type { SlowQueryEntry } from "../types/slow-query";

const VALID_LEVELS: readonly LogLevel[] = ["debug", "info", "warn", "error"];

export interface SystemHealthView {
  status: string;
  modules: { name: string; status: string; latencyMs: number }[];
  version: SystemVersionInfo;
  generatedAt: string;
}

export async function getSystemHealthHandler(): Promise<Result<SystemHealthView, AppError>> {
  const dashboard = await getSystemDashboardService().getDashboard();
  return ok({
    status: dashboard.status,
    modules: dashboard.modules.map((m) => ({ name: m.name, status: m.status, latencyMs: m.latencyMs })),
    version: dashboard.version,
    generatedAt: dashboard.generatedAt,
  });
}

export interface SystemMetricsView {
  metrics: MetricsSnapshot;
  alerts: Alert[];
  auditTimeline: AuditTimelineEntry[];
}

export async function getSystemMetricsHandler(): Promise<Result<SystemMetricsView, AppError>> {
  const dashboard = await getSystemDashboardService().getDashboard();
  return ok({
    metrics: metricsRegistry.getSnapshot(),
    alerts: getAlertService().getActiveAlerts(dashboard.modules, dashboard.slowQueries),
    auditTimeline: getAuditTimelineService().list(50),
  });
}

export interface LogsQuery {
  level?: string | null;
  scope?: string | null;
  limit?: string | null;
}

export function getSystemLogsHandler(query: LogsQuery): Result<CapturedLogEntry[], AppError> {
  let level: LogLevel | undefined;
  if (query.level) {
    if (!VALID_LEVELS.includes(query.level as LogLevel)) {
      return err(new ValidationError(`level must be one of: ${VALID_LEVELS.join(", ")}`));
    }
    level = query.level as LogLevel;
  }

  let limit: number | undefined;
  if (query.limit) {
    const parsed = Number(query.limit);
    if (!Number.isFinite(parsed) || parsed <= 0) return err(new ValidationError("limit must be a positive number"));
    limit = parsed;
  }

  return ok(logStore.list({ level, scope: query.scope ?? undefined, limit }));
}

export interface SystemPerformanceView {
  slowQueryThresholdMs: number;
  totalQueriesTracked: number;
  slowQueries: SlowQueryEntry[];
  moduleLatencies: { name: string; latencyMs: number }[];
}

export async function getSystemPerformanceHandler(): Promise<Result<SystemPerformanceView, AppError>> {
  const dashboard = await getSystemDashboardService().getDashboard();
  return ok({
    slowQueryThresholdMs: slowQueryTracker.threshold,
    totalQueriesTracked: slowQueryTracker.totalTracked,
    slowQueries: dashboard.slowQueries,
    moduleLatencies: dashboard.modules.map((m) => ({ name: m.name, latencyMs: m.latencyMs })),
  });
}

export async function getSystemModulesHandler(): Promise<Result<ModuleStatusReport[], AppError>> {
  const dashboard = await getSystemDashboardService().getDashboard();
  return ok(dashboard.modules);
}

export async function getSystemVersionHandler(): Promise<Result<SystemVersionInfo, AppError>> {
  return ok(getSystemVersion());
}
