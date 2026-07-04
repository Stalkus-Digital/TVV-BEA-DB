import { describe, expect, it } from "vitest";
import { HealthCheckRegistry } from "@/shared/health/health-registry";
import type { HealthCheck, HealthCheckResult } from "@/shared/health/health.types";

function fakeCheck(name: string, status: HealthCheckResult["status"]): HealthCheck {
  return { name, check: async () => ({ name, status, checkedAt: new Date().toISOString() }) };
}

describe("HealthCheckRegistry", () => {
  it("overall status is healthy when every check is healthy", async () => {
    const registry = new HealthCheckRegistry();
    registry.register(fakeCheck("a", "healthy"));
    registry.register(fakeCheck("b", "healthy"));
    const overall = await registry.getOverallHealth();
    expect(overall.status).toBe("healthy");
    expect(overall.checks).toHaveLength(2);
  });

  it("overall status degrades if any check is degraded (and none is unhealthy)", async () => {
    const registry = new HealthCheckRegistry();
    registry.register(fakeCheck("a", "healthy"));
    registry.register(fakeCheck("b", "degraded"));
    const overall = await registry.getOverallHealth();
    expect(overall.status).toBe("degraded");
  });

  it("unhealthy takes priority over degraded", async () => {
    const registry = new HealthCheckRegistry();
    registry.register(fakeCheck("a", "degraded"));
    registry.register(fakeCheck("b", "unhealthy"));
    const overall = await registry.getOverallHealth();
    expect(overall.status).toBe("unhealthy");
  });

  it("a throwing check is caught and reported as unhealthy, not propagated", async () => {
    const registry = new HealthCheckRegistry();
    registry.register({
      name: "flaky",
      check: async () => {
        throw new Error("connection refused");
      },
    });

    const overall = await registry.getOverallHealth();

    expect(overall.status).toBe("unhealthy");
    expect(overall.checks[0].name).toBe("flaky");
    expect(overall.checks[0].status).toBe("unhealthy");
    expect(overall.checks[0].details).toMatchObject({ error: "connection refused" });
  });

  it("an empty registry reports healthy (vacuously true, no check failed)", async () => {
    const registry = new HealthCheckRegistry();
    const overall = await registry.getOverallHealth();
    expect(overall.status).toBe("healthy");
    expect(overall.checks).toHaveLength(0);
  });
});
