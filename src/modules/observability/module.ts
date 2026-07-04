import { container, createToken, moduleRegistry, type ModuleDefinition } from "@/shared/di";
import { healthCheckRegistry, type HealthCheck, type HealthCheckResult } from "@/shared/health";
import { prisma } from "@/shared/database/prisma-client";
import { installLogCapture } from "./logging/log-capture";
import { slowQueryTracker } from "./performance/slow-query-tracker";
import { metricsRegistry } from "./metrics/metrics-registry";
import { ModuleStatusService } from "./dashboard/module-status.service";
import { SystemDashboardService } from "./dashboard/system-dashboard.service";
import { AuditTimelineService } from "./audit/audit-timeline.service";
import { AlertService } from "./alerts/alert.service";

export const MODULE_STATUS_SERVICE_TOKEN = createToken<ModuleStatusService>("observability.service.module-status");
export const AUDIT_TIMELINE_SERVICE_TOKEN = createToken<AuditTimelineService>("observability.service.audit-timeline");
export const ALERT_SERVICE_TOKEN = createToken<AlertService>("observability.service.alert");
export const SYSTEM_DASHBOARD_SERVICE_TOKEN = createToken<SystemDashboardService>("observability.service.system-dashboard");

let prismaListenerAttached = false;

/** Attaches the one `prisma.$on("query", ...)` listener that feeds `slowQueryTracker` from real, system-wide query activity — see `prisma-client.ts`'s docstring for why this is safe and why it's attached here rather than in that file. Idempotent, same guard style as `installLogCapture`. */
function attachPrismaQueryListener(): void {
  if (prismaListenerAttached) return;
  prisma.$on("query", (event) => {
    slowQueryTracker.record(event.query, event.duration, event.timestamp.toISOString());
  });
  prismaListenerAttached = true;
}

/**
 * Enterprise observability (Sprint 15) — the platform-services module every
 * other module is passively observed BY, never the other way around: zero
 * imports of any business module, and zero business-module file changed to
 * wire this in (structured logging capture and Prisma query events are
 * both opt-in hooks the shared foundation already exposes, not edits to
 * Package/Booking/Quote/Customer/Storage/etc. themselves).
 */
export const observabilityModule: ModuleDefinition = {
  name: "observability",
  register(c) {
    c.registerFactory(MODULE_STATUS_SERVICE_TOKEN, () => new ModuleStatusService());
    c.registerFactory(AUDIT_TIMELINE_SERVICE_TOKEN, () => new AuditTimelineService());
    c.registerFactory(ALERT_SERVICE_TOKEN, () => new AlertService());
    c.registerFactory(
      SYSTEM_DASHBOARD_SERVICE_TOKEN,
      () => new SystemDashboardService(c.resolve(MODULE_STATUS_SERVICE_TOKEN), c.resolve(AUDIT_TIMELINE_SERVICE_TOKEN), c.resolve(ALERT_SERVICE_TOKEN))
    );

    installLogCapture();
    attachPrismaQueryListener();
  },
};

class ObservabilityModuleHealthCheck implements HealthCheck {
  readonly name = "observability";
  async check(): Promise<HealthCheckResult> {
    return { name: this.name, status: "healthy", checkedAt: new Date().toISOString() };
  }
}

if (!moduleRegistry.getModule(observabilityModule.name)) {
  moduleRegistry.registerModule(observabilityModule);
  observabilityModule.register(container);
  healthCheckRegistry.register(new ObservabilityModuleHealthCheck());
}

export function getModuleStatusService(): ModuleStatusService {
  return container.resolve(MODULE_STATUS_SERVICE_TOKEN);
}
export function getAuditTimelineService(): AuditTimelineService {
  return container.resolve(AUDIT_TIMELINE_SERVICE_TOKEN);
}
export function getAlertService(): AlertService {
  return container.resolve(ALERT_SERVICE_TOKEN);
}
export function getSystemDashboardService(): SystemDashboardService {
  return container.resolve(SYSTEM_DASHBOARD_SERVICE_TOKEN);
}

/**
 * `middleware.ts` calls this once per request. Verified live (not assumed):
 * the counter it increments here never appears in `GET /api/system/metrics`
 * — confirmed by making 10+ requests through middleware and observing
 * `metrics.counters` stay permanently empty. This is the exact same
 * middleware/route-handler module-instance isolation already discovered
 * and documented in `modules/auth/middleware/auth-guard.ts` (there, it was
 * an in-memory session repository; here, it's this in-memory
 * `MetricsRegistry`) — Next.js's separate "nodejs middleware runtime"
 * genuinely does not share module-level singletons with the route-handler
 * process. Left in place because the logic itself is correct and is not
 * dead code from the route-handler side's perspective — a future counter
 * backed by a real shared store (e.g. a Postgres row incremented via
 * `$executeRaw`) would make it visible from both contexts identically to
 * how `DatabaseHealthCheck` already queries the same Postgres instance
 * from both sides today. See docs/34's Remaining TODOs.
 */
export function recordRequestSeen(method: string): void {
  metricsRegistry.increment("requests.seen.total");
  metricsRegistry.increment(`requests.seen.${method.toUpperCase()}`);
}
