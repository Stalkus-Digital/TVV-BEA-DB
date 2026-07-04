import { err, ok, type Result } from "@/shared/types";
import { ValidationError, type AppError } from "@/shared/errors";
import {
  getCircuitBreakerRegistry,
  getRuntimeEventBus,
  getRuntimeMetricsRegistry,
  getSupplierHealthMonitor,
} from "../module";
import type { SupplierRuntimeStatus } from "../health/supplier-runtime-status";
import type { RuntimeMetricsSnapshot } from "../metrics/runtime-metrics-registry";
import type { RuntimeEvent } from "../events/runtime-events";
import type { CircuitSnapshot } from "../circuit-breaker/circuit-state";
import type { HealthStatus } from "@/shared/health";

/**
 * Internal diagnostic handlers only — this sprint's explicit "no frontend
 * consumption" — read-only views over the runtime's own in-memory state.
 * None of these can fail in any way worth modeling as an `AppError` except
 * the logs-style `limit` query param, but every handler still returns
 * `Result` for the same uniform convention every other module's api/
 * layer follows.
 */
export interface RuntimeHealthView {
  status: HealthStatus;
  statuses: SupplierRuntimeStatus[];
}

export async function getRuntimeHealthHandler(): Promise<Result<RuntimeHealthView, AppError>> {
  const monitor = getSupplierHealthMonitor();
  return ok({ status: monitor.getOverallStatus(), statuses: monitor.getStatuses() });
}

export async function getRuntimeMetricsHandler(): Promise<Result<RuntimeMetricsSnapshot, AppError>> {
  return ok(getRuntimeMetricsRegistry().getSnapshot());
}

export async function getRuntimeEventsHandler(limitParam: string | null): Promise<Result<RuntimeEvent[], AppError>> {
  let limit = 50;
  if (limitParam) {
    const parsed = Number(limitParam);
    if (!Number.isFinite(parsed) || parsed <= 0) return err(new ValidationError("limit must be a positive number"));
    limit = parsed;
  }
  return ok(getRuntimeEventBus().recentEvents(limit));
}

export async function getRuntimeCircuitBreakersHandler(): Promise<Result<CircuitSnapshot[], AppError>> {
  return ok(getCircuitBreakerRegistry().getAllSnapshots());
}
