import type { HealthStatus } from "@/shared/health";
import type { RuntimeMetricsRegistry } from "../metrics/runtime-metrics-registry";
import type { CircuitBreakerRegistry } from "../circuit-breaker/circuit-breaker-registry";
import { CircuitState } from "../circuit-breaker/circuit-state";
import type { SupplierRuntimeStatus } from "./supplier-runtime-status";

const DEGRADED_SUCCESS_RATE_FLOOR = 0.5;

/**
 * "Per Supplier" + "Per Capability" rolling health, this sprint's explicit
 * Health requirement — reads raw `ExecutionRecord`s from `RuntimeMetricsRegistry`
 * (never recomputes success rate its own way) and cross-references each
 * key's live `CircuitBreaker` state, rather than tracking a third, separate
 * copy of the same data.
 */
export class SupplierHealthMonitor {
  constructor(
    private readonly metricsRegistry: RuntimeMetricsRegistry,
    private readonly breakerRegistry: CircuitBreakerRegistry
  ) {}

  getStatuses(): SupplierRuntimeStatus[] {
    const snapshot = this.metricsRegistry.getSnapshot();
    const breakerSnapshots = new Map(this.breakerRegistry.getAllSnapshots().map((b) => [b.key, b]));

    return snapshot.byKey.map(({ key, stats }) => {
      const [supplierCode, capability] = key.split(":");
      const records = this.metricsRegistry.forKey(key);
      const lastExecutedAt = records.length > 0 ? records[records.length - 1].timestamp : null;
      const breaker = breakerSnapshots.get(key);

      return {
        key,
        supplierCode,
        capability,
        circuitState: breaker?.state ?? CircuitState.CLOSED,
        successRate: stats.successRate,
        avgLatencyMs: stats.avgDurationMs,
        totalExecutions: stats.count,
        lastExecutedAt,
      };
    });
  }

  /** Feeds `SupplierRuntimeHealthCheck` — OPEN anywhere is unhealthy, HALF_OPEN or a low success rate is degraded, no tracked executions yet is healthy (nothing has failed). */
  getOverallStatus(): HealthStatus {
    const statuses = this.getStatuses();
    if (statuses.some((s) => s.circuitState === CircuitState.OPEN)) return "unhealthy";
    if (statuses.some((s) => s.circuitState === CircuitState.HALF_OPEN || s.successRate < DEGRADED_SUCCESS_RATE_FLOOR)) return "degraded";
    return "healthy";
  }
}
