import { describe, expect, it } from "vitest";
import { mapHealthStatusToModuleStatus, WARNING_LATENCY_MS } from "@/modules/observability/dashboard/module-status.service";
import { ModuleStatus } from "@/modules/observability/types/module-status";

describe("mapHealthStatusToModuleStatus", () => {
  it("maps unhealthy to OFFLINE regardless of latency", () => {
    expect(mapHealthStatusToModuleStatus("unhealthy", 1)).toBe(ModuleStatus.OFFLINE);
    expect(mapHealthStatusToModuleStatus("unhealthy", 10_000)).toBe(ModuleStatus.OFFLINE);
  });

  it("maps degraded to DEGRADED regardless of latency", () => {
    expect(mapHealthStatusToModuleStatus("degraded", 1)).toBe(ModuleStatus.DEGRADED);
  });

  it("maps healthy + low latency to HEALTHY", () => {
    expect(mapHealthStatusToModuleStatus("healthy", 1)).toBe(ModuleStatus.HEALTHY);
    expect(mapHealthStatusToModuleStatus("healthy", WARNING_LATENCY_MS - 1)).toBe(ModuleStatus.HEALTHY);
  });

  it("maps healthy + elevated latency to WARNING — the one state Observability adds beyond the shared HealthStatus", () => {
    expect(mapHealthStatusToModuleStatus("healthy", WARNING_LATENCY_MS)).toBe(ModuleStatus.WARNING);
    expect(mapHealthStatusToModuleStatus("healthy", WARNING_LATENCY_MS + 100)).toBe(ModuleStatus.WARNING);
  });
});
