import { healthCheckRegistry } from "@/shared/health";
import type { HealthStatus } from "@/shared/health";
import { metricsRegistry } from "../metrics/metrics-registry";
import { slowQueryTracker } from "../performance/slow-query-tracker";
import type { ModuleStatusReport } from "../types/module-status";
import type { MetricsSnapshot } from "../types/metric";
import type { SlowQueryEntry } from "../types/slow-query";
import type { SystemVersionInfo } from "../types/system-version";
import type { Alert } from "../types/alert";
import { ModuleStatusService } from "./module-status.service";
import { getSystemVersion } from "./system-version.service";
import { AuditTimelineService } from "../audit/audit-timeline.service";
import { AlertService } from "../alerts/alert.service";

export interface SystemDashboard {
  status: HealthStatus;
  modules: ModuleStatusReport[];
  metrics: MetricsSnapshot;
  slowQueries: SlowQueryEntry[];
  alerts: Alert[];
  version: SystemVersionInfo;
  generatedAt: string;
}

/**
 * The single aggregator every `/api/system/*` handler reads from — reuses
 * the shared `healthCheckRegistry` for overall status rather than
 * recomputing it. Also the one place that feeds the audit timeline: every
 * call diffs the freshly-computed module statuses against what was seen
 * last time and records any transition.
 */
export class SystemDashboardService {
  constructor(
    private readonly moduleStatusService: ModuleStatusService,
    private readonly auditTimeline: AuditTimelineService,
    private readonly alertService: AlertService
  ) {}

  async getDashboard(): Promise<SystemDashboard> {
    const [overall, modules] = await Promise.all([healthCheckRegistry.getOverallHealth(), this.moduleStatusService.getModuleStatuses()]);
    this.auditTimeline.recordStatusTransitions(modules);

    const slowQueries = slowQueryTracker.listSlow(10);
    return {
      status: overall.status,
      modules,
      metrics: metricsRegistry.getSnapshot(),
      slowQueries,
      alerts: this.alertService.getActiveAlerts(modules, slowQueries),
      version: getSystemVersion(),
      generatedAt: new Date().toISOString(),
    };
  }
}
