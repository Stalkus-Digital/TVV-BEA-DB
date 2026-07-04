import type { HealthCheck, HealthCheckResult } from "../health.types";

/** Trivial built-in check confirming the process itself is up. */
export class SelfHealthCheck implements HealthCheck {
  readonly name = "self";

  async check(): Promise<HealthCheckResult> {
    return {
      name: this.name,
      status: "healthy",
      checkedAt: new Date().toISOString(),
    };
  }
}
