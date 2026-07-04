import { describe, expect, it } from "vitest";
import { CRITICAL_QUERY_DURATION_MS, evaluateAlerts } from "@/modules/observability/alerts/alert-rule";
import { AlertSeverity } from "@/modules/observability/types/alert";
import { ModuleStatus, type ModuleStatusReport } from "@/modules/observability/types/module-status";
import type { SlowQueryEntry } from "@/modules/observability/types/slow-query";

function report(name: string, status: ModuleStatus, latencyMs = 1): ModuleStatusReport {
  return { name, status, latencyMs, lastActivityAt: null };
}

function query(durationMs: number): SlowQueryEntry {
  return { query: "SELECT 1", durationMs, timestamp: new Date().toISOString(), isSlow: durationMs >= 200 };
}

describe("evaluateAlerts", () => {
  it("raises no alerts for an all-healthy, all-fast system", () => {
    const alerts = evaluateAlerts([report("booking", ModuleStatus.HEALTHY)], [query(10)]);
    expect(alerts).toHaveLength(0);
  });

  it("raises a CRITICAL alert for an OFFLINE module", () => {
    const alerts = evaluateAlerts([report("booking", ModuleStatus.OFFLINE)], []);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe(AlertSeverity.CRITICAL);
    expect(alerts[0].source).toBe("booking");
  });

  it("raises a WARNING alert for a DEGRADED module", () => {
    const alerts = evaluateAlerts([report("quote", ModuleStatus.DEGRADED)], []);
    expect(alerts[0].severity).toBe(AlertSeverity.WARNING);
  });

  it("raises a WARNING alert for a WARNING (elevated-latency) module", () => {
    const alerts = evaluateAlerts([report("package", ModuleStatus.WARNING, 750)], []);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe(AlertSeverity.WARNING);
    expect(alerts[0].message).toContain("750");
  });

  it("raises a CRITICAL alert for a query at/above the critical duration threshold", () => {
    const alerts = evaluateAlerts([], [query(CRITICAL_QUERY_DURATION_MS)]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe(AlertSeverity.CRITICAL);
    expect(alerts[0].source).toBe("database");
  });

  it("does not alert on a slow-but-not-critical query", () => {
    const alerts = evaluateAlerts([], [query(300)]);
    expect(alerts).toHaveLength(0);
  });

  it("aggregates alerts from both modules and slow queries together", () => {
    const alerts = evaluateAlerts([report("booking", ModuleStatus.OFFLINE)], [query(CRITICAL_QUERY_DURATION_MS)]);
    expect(alerts).toHaveLength(2);
  });
});
