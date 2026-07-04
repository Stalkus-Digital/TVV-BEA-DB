import { describe, expect, it } from "vitest";
import { computeExecutionStats, type ExecutionRecord } from "@/modules/supplier/runtime/metrics/execution-record";
import { RuntimeMetricsRegistry } from "@/modules/supplier/runtime/metrics/runtime-metrics-registry";

function record(overrides: Partial<ExecutionRecord> = {}): ExecutionRecord {
  return {
    key: "tripjack:HOTELS",
    supplierCode: "tripjack",
    capability: "HOTELS",
    durationMs: 100,
    success: true,
    timedOut: false,
    circuitRejected: false,
    retries: 0,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe("computeExecutionStats", () => {
  it("returns a neutral (100% success) baseline for an empty set", () => {
    const stats = computeExecutionStats([]);
    expect(stats.count).toBe(0);
    expect(stats.successRate).toBe(1);
  });

  it("computes success rate, average duration, retries, and timeouts across records", () => {
    const stats = computeExecutionStats([
      record({ durationMs: 100, success: true, retries: 0 }),
      record({ durationMs: 200, success: false, retries: 2, timedOut: true }),
    ]);
    expect(stats.count).toBe(2);
    expect(stats.successRate).toBe(0.5);
    expect(stats.avgDurationMs).toBe(150);
    expect(stats.totalRetries).toBe(2);
    expect(stats.totalTimeouts).toBe(1);
    expect(stats.totalFailures).toBe(1);
  });
});

describe("RuntimeMetricsRegistry", () => {
  it("groups records by key in its snapshot", () => {
    const registry = new RuntimeMetricsRegistry();
    registry.record(record({ key: "a:HOTELS", success: true }));
    registry.record(record({ key: "b:FLIGHTS", success: false }));
    const snapshot = registry.getSnapshot();
    expect(snapshot.byKey.map((k) => k.key)).toEqual(["a:HOTELS", "b:FLIGHTS"]);
    expect(snapshot.overall.count).toBe(2);
  });

  it("evicts the oldest record once capacity is exceeded", () => {
    const registry = new RuntimeMetricsRegistry(2);
    registry.record(record({ key: "x", timestamp: "1" }));
    registry.record(record({ key: "x", timestamp: "2" }));
    registry.record(record({ key: "x", timestamp: "3" }));
    expect(registry.forKey("x")).toHaveLength(2);
    expect(registry.forKey("x").map((r) => r.timestamp)).toEqual(["2", "3"]);
  });

  it("forKey filters to only that key's records", () => {
    const registry = new RuntimeMetricsRegistry();
    registry.record(record({ key: "a" }));
    registry.record(record({ key: "b" }));
    expect(registry.forKey("a")).toHaveLength(1);
  });
});
