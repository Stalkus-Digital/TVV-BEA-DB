import { describe, expect, it, vi } from "vitest";
import { CircuitBreaker } from "@/modules/supplier/runtime/circuit-breaker/circuit-breaker";
import { CircuitState, type CircuitBreakerConfig } from "@/modules/supplier/runtime/circuit-breaker/circuit-state";
import { CircuitBreakerRegistry, breakerKey } from "@/modules/supplier/runtime/circuit-breaker/circuit-breaker-registry";
import { SupplierCapability } from "@/modules/supplier/types/supplier-capability";

const config: CircuitBreakerConfig = { failureThreshold: 3, cooldownMs: 100, successThreshold: 2 };

describe("CircuitBreaker", () => {
  it("starts CLOSED and allows attempts", () => {
    const breaker = new CircuitBreaker("test", config);
    expect(breaker.canAttempt()).toBe(true);
    expect(breaker.getSnapshot().state).toBe(CircuitState.CLOSED);
  });

  it("trips to OPEN after failureThreshold consecutive failures", () => {
    const breaker = new CircuitBreaker("test", config);
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getSnapshot().state).toBe(CircuitState.CLOSED);
    breaker.recordFailure();
    expect(breaker.getSnapshot().state).toBe(CircuitState.OPEN);
  });

  it("rejects attempts while OPEN and within the cooldown", () => {
    const breaker = new CircuitBreaker("test", config);
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.canAttempt()).toBe(false);
  });

  it("a success while CLOSED resets the failure count", () => {
    const breaker = new CircuitBreaker("test", config);
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordSuccess();
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getSnapshot().state).toBe(CircuitState.CLOSED);
  });

  it("transitions OPEN -> HALF_OPEN automatically once the cooldown elapses", async () => {
    vi.useFakeTimers();
    const breaker = new CircuitBreaker("test", config);
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getSnapshot().state).toBe(CircuitState.OPEN);

    vi.advanceTimersByTime(config.cooldownMs + 1);
    expect(breaker.canAttempt()).toBe(true);
    expect(breaker.getSnapshot().state).toBe(CircuitState.HALF_OPEN);
    vi.useRealTimers();
  });

  it("HALF_OPEN closes again after successThreshold consecutive successes", async () => {
    vi.useFakeTimers();
    const breaker = new CircuitBreaker("test", config);
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure();
    vi.advanceTimersByTime(config.cooldownMs + 1);
    breaker.canAttempt();
    expect(breaker.getSnapshot().state).toBe(CircuitState.HALF_OPEN);

    breaker.recordSuccess();
    expect(breaker.getSnapshot().state).toBe(CircuitState.HALF_OPEN);
    breaker.recordSuccess();
    expect(breaker.getSnapshot().state).toBe(CircuitState.CLOSED);
    vi.useRealTimers();
  });

  it("a single failure while HALF_OPEN trips straight back to OPEN", async () => {
    vi.useFakeTimers();
    const breaker = new CircuitBreaker("test", config);
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure();
    vi.advanceTimersByTime(config.cooldownMs + 1);
    breaker.canAttempt();
    expect(breaker.getSnapshot().state).toBe(CircuitState.HALF_OPEN);

    breaker.recordFailure();
    expect(breaker.getSnapshot().state).toBe(CircuitState.OPEN);
    vi.useRealTimers();
  });
});

describe("breakerKey", () => {
  it("combines supplier code and capability", () => {
    expect(breakerKey("tripjack", SupplierCapability.HOTELS)).toBe("tripjack:HOTELS");
  });
});

describe("CircuitBreakerRegistry", () => {
  it("creates one breaker per unique key and reuses it on subsequent calls", () => {
    const registry = new CircuitBreakerRegistry(config);
    const first = registry.getOrCreate("a:HOTELS");
    const second = registry.getOrCreate("a:HOTELS");
    expect(first).toBe(second);
  });

  it("getAllSnapshots returns one snapshot per distinct key, sorted", () => {
    const registry = new CircuitBreakerRegistry(config);
    registry.getOrCreate("b:HOTELS");
    registry.getOrCreate("a:FLIGHTS");
    const snapshots = registry.getAllSnapshots();
    expect(snapshots.map((s) => s.key)).toEqual(["a:FLIGHTS", "b:HOTELS"]);
  });
});
