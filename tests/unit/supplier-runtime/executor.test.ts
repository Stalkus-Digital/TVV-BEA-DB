import { describe, expect, it } from "vitest";
import { ok, err, isErr, isOk } from "@/shared/types";
import { InternalError, TimeoutError } from "@/shared/errors";
import { createLogger } from "@/shared/logger";
import { SupplierExecutor } from "@/modules/supplier/runtime/executor/supplier-executor";
import { CircuitBreakerRegistry, breakerKey } from "@/modules/supplier/runtime/circuit-breaker";
import { RuntimeMetricsRegistry } from "@/modules/supplier/runtime/metrics";
import { RuntimeEventBus, RuntimeEventType } from "@/modules/supplier/runtime/events";
import { SupplierOperation } from "@/modules/supplier/runtime/timeouts";
import { SupplierCapability } from "@/modules/supplier/types/supplier-capability";
import { createFakeSupplier } from "./fake-supplier";

function buildExecutor(breakerConfig = { failureThreshold: 2, cooldownMs: 50, successThreshold: 1 }) {
  const breakerRegistry = new CircuitBreakerRegistry(breakerConfig);
  const metricsRegistry = new RuntimeMetricsRegistry();
  const eventBus = new RuntimeEventBus();
  const executor = new SupplierExecutor({ breakerRegistry, metricsRegistry, eventBus, logger: createLogger("test.supplier-runtime.executor") });
  return { executor, breakerRegistry, metricsRegistry, eventBus };
}

describe("SupplierExecutor.execute", () => {
  it("succeeds on the first call, records a success metric, no retries", async () => {
    const { executor, metricsRegistry } = buildExecutor();
    const supplier = createFakeSupplier("tripjack", [SupplierCapability.HOTELS]);

    const result = await executor.execute(supplier, SupplierCapability.HOTELS, SupplierOperation.SEARCH, async () => ok("data"));

    expect(isOk(result)).toBe(true);
    const key = breakerKey("tripjack", SupplierCapability.HOTELS);
    const records = metricsRegistry.forKey(key);
    expect(records).toHaveLength(1);
    expect(records[0].success).toBe(true);
    expect(records[0].retries).toBe(0);
  });

  it("publishes REQUEST_STARTED then REQUEST_COMPLETED on success", async () => {
    const { executor, eventBus } = buildExecutor();
    const supplier = createFakeSupplier("tripjack", [SupplierCapability.HOTELS]);

    await executor.execute(supplier, SupplierCapability.HOTELS, SupplierOperation.SEARCH, async () => ok("data"));

    const types = eventBus.recentEvents(10).reverse().map((e) => e.type);
    expect(types).toEqual([RuntimeEventType.REQUEST_STARTED, RuntimeEventType.REQUEST_COMPLETED]);
  });

  it("marks a TimeoutError outcome as timedOut in metrics and publishes REQUEST_TIMED_OUT", async () => {
    const { executor, metricsRegistry, eventBus } = buildExecutor();
    const supplier = createFakeSupplier("tripjack", [SupplierCapability.HOTELS]);

    // A call resolving to its own TimeoutError is indistinguishable, from the executor's
    // bookkeeping perspective, from withTimeout()'s real timer firing — this avoids
    // waiting out the real (multi-second) default per-capability timeout in a unit test.
    await executor.execute(supplier, SupplierCapability.HOTELS, SupplierOperation.SEARCH, async () => err(new TimeoutError("simulated timeout")));

    const key = breakerKey("tripjack", SupplierCapability.HOTELS);
    const records = metricsRegistry.forKey(key);
    expect(records[records.length - 1].timedOut).toBe(true);
    const timedOutEvents = eventBus.recentEvents(20).filter((e) => e.type === RuntimeEventType.REQUEST_TIMED_OUT);
    expect(timedOutEvents.length).toBeGreaterThan(0);
  });

  it("retries a transient failure and eventually succeeds (real backoff delay)", async () => {
    const { executor, metricsRegistry, eventBus } = buildExecutor();
    const supplier = createFakeSupplier("tripjack", [SupplierCapability.HOTELS]);
    let calls = 0;

    const result = await executor.execute(supplier, SupplierCapability.HOTELS, SupplierOperation.SEARCH, async () => {
      calls += 1;
      if (calls < 2) return err(new InternalError("transient"));
      return ok("recovered");
    });

    expect(isOk(result)).toBe(true);
    expect(calls).toBe(2);
    const key = breakerKey("tripjack", SupplierCapability.HOTELS);
    expect(metricsRegistry.forKey(key)[0].retries).toBe(1);
    expect(eventBus.recentEvents(20).some((e) => e.type === RuntimeEventType.REQUEST_RETRIED)).toBe(true);
  }, 10_000);

  it("opens the circuit after consecutive failures and rejects the next attempt without calling the supplier", async () => {
    const { executor, breakerRegistry, eventBus } = buildExecutor({ failureThreshold: 1, cooldownMs: 10_000, successThreshold: 1 });
    const supplier = createFakeSupplier("tripjack", [SupplierCapability.HOTELS]);

    const first = await executor.execute(supplier, SupplierCapability.HOTELS, SupplierOperation.SEARCH, async () => err(new InternalError("boom")), undefined);
    expect(isErr(first)).toBe(true);

    let calledAgain = false;
    const second = await executor.execute(supplier, SupplierCapability.HOTELS, SupplierOperation.SEARCH, async () => {
      calledAgain = true;
      return ok("should not happen");
    });

    expect(isErr(second)).toBe(true);
    if (isErr(second)) expect(second.error.name).toBe("ServiceUnavailableError");
    expect(calledAgain).toBe(false);
    expect(eventBus.recentEvents(20).some((e) => e.type === RuntimeEventType.CIRCUIT_OPENED)).toBe(true);

    const key = breakerKey("tripjack", SupplierCapability.HOTELS);
    expect(breakerRegistry.getOrCreate(key).getSnapshot().state).toBe("OPEN");
  }, 10_000);
});
