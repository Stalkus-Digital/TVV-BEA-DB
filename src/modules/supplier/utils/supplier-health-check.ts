import type { HealthCheck, HealthCheckResult, HealthStatus } from "@/shared/health";
import type { Supplier } from "../types";

/**
 * Wraps a Supplier so it can register with the shared health-check
 * framework — this is what makes GET /api/health automatically include
 * supplier status, with zero change to the health route itself or the
 * shared HealthCheckRegistry.
 */
export class SupplierHealthCheck implements HealthCheck {
  readonly name: string;

  constructor(private readonly supplier: Supplier) {
    this.name = `supplier.${supplier.code}`;
  }

  async check(): Promise<HealthCheckResult> {
    const result = await this.supplier.health();

    if (!result.ok) {
      return {
        name: this.name,
        status: "unhealthy",
        details: { error: result.error.message },
        checkedAt: new Date().toISOString(),
      };
    }

    // Placeholder adapters report healthy: false ("not yet implemented") —
    // that's "degraded" (registered and running, just not backed by a real
    // API yet), not "unhealthy" (broken/erroring).
    const status: HealthStatus = result.value.healthy ? "healthy" : "degraded";
    return {
      name: this.name,
      status,
      details: result.value.message ? { message: result.value.message } : undefined,
      checkedAt: result.value.checkedAt,
    };
  }
}
