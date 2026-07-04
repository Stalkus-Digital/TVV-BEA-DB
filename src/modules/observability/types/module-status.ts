/**
 * A richer 4-state model than the shared `HealthStatus` (healthy/unhealthy/
 * degraded) every module's `HealthCheck` already reports. Deliberately NOT
 * a change to `src/shared/health` — that type is depended on by all 11
 * business modules and stays exactly as it is. `ModuleStatusService` maps
 * the existing 3-state signal, enriched with latency this module measures
 * itself, onto this 4-state one:
 *   - underlying "healthy" + latency below the warning threshold -> HEALTHY
 *   - underlying "healthy" + latency at/above the warning threshold -> WARNING (a signal only Observability adds)
 *   - underlying "degraded" -> DEGRADED
 *   - underlying "unhealthy" (or the check threw) -> OFFLINE
 */
export const ModuleStatus = {
  HEALTHY: "HEALTHY",
  WARNING: "WARNING",
  DEGRADED: "DEGRADED",
  OFFLINE: "OFFLINE",
} as const;

export type ModuleStatus = (typeof ModuleStatus)[keyof typeof ModuleStatus];

export interface ModuleStatusReport {
  name: string;
  status: ModuleStatus;
  latencyMs: number;
  lastActivityAt: string | null;
  details?: Record<string, unknown>;
}
