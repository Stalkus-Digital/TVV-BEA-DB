export type HealthStatus = "healthy" | "unhealthy" | "degraded";

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  details?: Record<string, unknown>;
  checkedAt: string;
}

export interface HealthCheck {
  readonly name: string;
  check(): Promise<HealthCheckResult>;
}
