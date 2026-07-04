import { describe, expect, it } from "vitest";
import { RuntimeMetricsRegistry } from "@/modules/supplier/runtime/metrics/runtime-metrics-registry";
import type { ExecutionRecord } from "@/modules/supplier/runtime/metrics/execution-record";
import { CircuitBreakerRegistry, breakerKey } from "@/modules/supplier/runtime/circuit-breaker";
import { SupplierHealthMonitor } from "@/modules/supplier/runtime/health/supplier-health-monitor";
import { SupplierCapability } from "@/modules/supplier/types/supplier-capability";

function record(overrides: Partial<ExecutionRecord> = {}): ExecutionRecord {
  return {
    key: breakerKey("tripjack", SupplierCapability.HOTELS),
    supplierCode: "tripjack",
    capability: SupplierCapability.HOTELS,
    durationMs: 50,
    success: true,
    timedOut: false,
    circuitRejected: false,
    retries: 0,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe("SupplierHealthMonitor", () => {
  it("reports healthy overall status when there are no tracked executions yet", () => {
    const monitor = new SupplierHealthMonitor(new RuntimeMetricsRegistry(), new CircuitBreakerRegistry({ failureThreshold: 5, cooldownMs: 1000, successThreshold: 1 }));
    expect(monitor.getOverallStatus()).toBe("healthy");
    expect(monitor.getStatuses()).toHaveLength(0);
  });

  it("derives per-key success rate and latency from raw execution records", () => {
    const metrics = new RuntimeMetricsRegistry();
    metrics.record(record({ durationMs: 100, success: true }));
    metrics.record(record({ durationMs: 200, success: false }));
    const monitor = new SupplierHealthMonitor(metrics, new CircuitBreakerRegistry({ failureThreshold: 5, cooldownMs: 1000, successThreshold: 1 }));

    const [status] = monitor.getStatuses();
    expect(status.supplierCode).toBe("tripjack");
    expect(status.capability).toBe(SupplierCapability.HOTELS);
    expect(status.successRate).toBe(0.5);
    expect(status.avgLatencyMs).toBe(150);
    expect(status.totalExecutions).toBe(2);
    expect(status.lastExecutedAt).not.toBeNull();
  });

  it("reports unhealthy overall when any breaker is OPEN", () => {
    const metrics = new RuntimeMetricsRegistry();
    metrics.record(record({ success: false }));
    const breakerRegistry = new CircuitBreakerRegistry({ failureThreshold: 1, cooldownMs: 100_000, successThreshold: 1 });
    breakerRegistry.getOrCreate(breakerKey("tripjack", SupplierCapability.HOTELS)).recordFailure();

    const monitor = new SupplierHealthMonitor(metrics, breakerRegistry);
    expect(monitor.getOverallStatus()).toBe("unhealthy");
    expect(monitor.getStatuses()[0].circuitState).toBe("OPEN");
  });

  it("reports degraded overall when success rate is low but no breaker is open", () => {
    const metrics = new RuntimeMetricsRegistry();
    metrics.record(record({ success: false }));
    metrics.record(record({ success: false }));
    metrics.record(record({ success: true }));
    const monitor = new SupplierHealthMonitor(metrics, new CircuitBreakerRegistry({ failureThreshold: 100, cooldownMs: 1000, successThreshold: 1 }));

    expect(monitor.getOverallStatus()).toBe("degraded");
  });
});
