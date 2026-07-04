import { healthCheckRegistry } from "@/shared/health";
import type { HealthCheck, HealthStatus } from "@/shared/health";
import { logStore } from "../logging/log-store";
import { startTimer } from "../performance/timer";
import { ModuleStatus, type ModuleStatusReport } from "../types/module-status";

const WARNING_LATENCY_MS = 500;

/** Pure — extracted so tests can assert the 3-state -> 4-state mapping directly, without needing a real `HealthCheck`. */
export function mapHealthStatusToModuleStatus(status: HealthStatus, latencyMs: number): ModuleStatus {
  if (status === "unhealthy") return ModuleStatus.OFFLINE;
  if (status === "degraded") return ModuleStatus.DEGRADED;
  return latencyMs >= WARNING_LATENCY_MS ? ModuleStatus.WARNING : ModuleStatus.HEALTHY;
}

/**
 * Layers a richer 4-state model on top of the existing, shared
 * `healthCheckRegistry` — reuses every module's already-registered
 * `HealthCheck` (11 business modules + this one), times each individually
 * (something `runAll()`/`getOverallHealth()` never exposed), and enriches
 * with "Last Activity" derived from `LogStore` (falling back to the
 * check's own `checkedAt` when nothing has logged under that scope yet).
 */
export class ModuleStatusService {
  async getModuleStatuses(): Promise<ModuleStatusReport[]> {
    const checks = healthCheckRegistry.getRegisteredChecks();
    const reports = await Promise.all(checks.map((check) => this.runOne(check)));
    return reports.sort((a, b) => a.name.localeCompare(b.name));
  }

  private async runOne(check: HealthCheck): Promise<ModuleStatusReport> {
    const done = startTimer();
    try {
      const result = await check.check();
      const latencyMs = done();
      return {
        name: result.name,
        status: mapHealthStatusToModuleStatus(result.status, latencyMs),
        latencyMs,
        lastActivityAt: logStore.mostRecentForScope(result.name)?.timestamp ?? result.checkedAt,
        details: result.details,
      };
    } catch (error) {
      const latencyMs = done();
      return {
        name: check.name,
        status: ModuleStatus.OFFLINE,
        latencyMs,
        lastActivityAt: logStore.mostRecentForScope(check.name)?.timestamp ?? null,
        details: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  }
}

/** Exported so tests can assert against the same threshold this service actually uses. */
export { WARNING_LATENCY_MS };
