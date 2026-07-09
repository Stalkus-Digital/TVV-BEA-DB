import type { HealthCheck, HealthCheckResult, HealthStatus } from "./health.types";
import { SelfHealthCheck } from "./checks/self-check";
import { DatabaseHealthCheck } from "./checks/database-check";

export interface OverallHealth {
  status: HealthStatus;
  checks: HealthCheckResult[];
}

/**
 * Future modules register their own HealthCheck implementations here (e.g. a
 * supplier module later adding a "tripjack" check). No module-specific
 * checks are registered yet — only the built-in self check.
 */
export class HealthCheckRegistry {
  private readonly checks = new Map<string, HealthCheck>();

  register(check: HealthCheck): void {
    this.checks.set(check.name, check);
  }

  /** Read-only access to every registered check, e.g. for Observability's per-module latency timing (which `runAll`/`getOverallHealth` don't expose individually). */
  getRegisteredChecks(): HealthCheck[] {
    return Array.from(this.checks.values());
  }

  async runAll(): Promise<HealthCheckResult[]> {
    return Promise.all(Array.from(this.checks.values()).map((check) => this.runSafely(check)));
  }

  async getOverallHealth(): Promise<OverallHealth> {
    const checks = await this.runAll();
    const status: HealthStatus = checks.some((c) => c.status === "unhealthy")
      ? "unhealthy"
      : checks.some((c) => c.status === "degraded")
        ? "degraded"
        : "healthy";
    return { status, checks };
  }

  private async runSafely(check: HealthCheck): Promise<HealthCheckResult> {
    try {
      return await check.check();
    } catch (error) {
      return {
        name: check.name,
        status: "unhealthy",
        details: { error: error instanceof Error ? error.message : String(error) },
        checkedAt: new Date().toISOString(),
      };
    }
  }
}

/** App-wide default health registry, seeded with the built-in self and database checks. */
const globalForHealthRegistry = globalThis as unknown as {
  __app_health_registry: HealthCheckRegistry | undefined;
};

export const healthCheckRegistry = globalForHealthRegistry.__app_health_registry ?? new HealthCheckRegistry();
if (process.env.NODE_ENV !== "production") {
  globalForHealthRegistry.__app_health_registry = healthCheckRegistry;
}
healthCheckRegistry.register(new SelfHealthCheck());
healthCheckRegistry.register(new DatabaseHealthCheck());
