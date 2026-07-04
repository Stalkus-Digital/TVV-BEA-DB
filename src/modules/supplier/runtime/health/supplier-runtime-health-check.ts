import type { HealthCheck, HealthCheckResult } from "@/shared/health";
import type { SupplierHealthMonitor } from "./supplier-health-monitor";

/** Registered into the same shared `healthCheckRegistry` every other module uses — `GET /api/health` picks this up automatically, zero changes to that route. */
export class SupplierRuntimeHealthCheck implements HealthCheck {
  readonly name = "supplier-runtime";

  constructor(private readonly monitor: SupplierHealthMonitor) {}

  async check(): Promise<HealthCheckResult> {
    const statuses = this.monitor.getStatuses();
    return {
      name: this.name,
      status: this.monitor.getOverallStatus(),
      details: { trackedKeys: statuses.length },
      checkedAt: new Date().toISOString(),
    };
  }
}
