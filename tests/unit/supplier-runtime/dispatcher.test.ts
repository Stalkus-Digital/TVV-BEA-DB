import { describe, expect, it } from "vitest";
import { ok, err, isErr, isOk } from "@/shared/types";
import { InternalError } from "@/shared/errors";
import { createLogger } from "@/shared/logger";
import { SupplierRegistry } from "@/modules/supplier/services/supplier-registry";
import { SupplierExecutor } from "@/modules/supplier/runtime/executor/supplier-executor";
import { CircuitBreakerRegistry } from "@/modules/supplier/runtime/circuit-breaker";
import { RuntimeMetricsRegistry } from "@/modules/supplier/runtime/metrics";
import { RuntimeEventBus } from "@/modules/supplier/runtime/events";
import { DefaultRoutingPolicy } from "@/modules/supplier/runtime/policies/routing-policy";
import { SupplierDispatcher } from "@/modules/supplier/runtime/dispatcher/supplier-dispatcher";
import { SupplierOperation } from "@/modules/supplier/runtime/timeouts";
import { SupplierCapability } from "@/modules/supplier/types/supplier-capability";
import { createFakeSupplier } from "./fake-supplier";

function buildDispatcher() {
  const registry = new SupplierRegistry();
  const breakerRegistry = new CircuitBreakerRegistry({ failureThreshold: 100, cooldownMs: 10_000, successThreshold: 1 });
  const metricsRegistry = new RuntimeMetricsRegistry();
  const eventBus = new RuntimeEventBus();
  const executor = new SupplierExecutor({ breakerRegistry, metricsRegistry, eventBus, logger: createLogger("test.supplier-runtime.dispatcher") });
  const dispatcher = new SupplierDispatcher(registry, new DefaultRoutingPolicy(), executor);
  return { registry, dispatcher };
}

describe("SupplierDispatcher.dispatch", () => {
  it("returns NotFoundError when no supplier is registered for the requested capability", async () => {
    const { dispatcher } = buildDispatcher();
    const response = await dispatcher.dispatch({
      capability: SupplierCapability.VISA,
      operation: SupplierOperation.SEARCH,
      call: async () => ok("unreachable"),
    });
    expect(isErr(response.result)).toBe(true);
    if (isErr(response.result)) expect(response.result.error.name).toBe("NotFoundError");
  });

  it("dispatches to the single matching supplier and returns a normalized response", async () => {
    const { registry, dispatcher } = buildDispatcher();
    registry.register(createFakeSupplier("tripjack", [SupplierCapability.HOTELS]));

    const response = await dispatcher.dispatch({
      capability: SupplierCapability.HOTELS,
      operation: SupplierOperation.SEARCH,
      call: async (supplier) => ok(`results-from-${supplier.code}`),
    });

    expect(response.supplierCode).toBe("tripjack");
    expect(isOk(response.result)).toBe(true);
    if (isOk(response.result)) expect(response.result.value).toBe("results-from-tripjack");
  });

  it("fails over to the next matching supplier when the first one's call fails", async () => {
    const { registry, dispatcher } = buildDispatcher();
    registry.register(createFakeSupplier("failing-supplier", [SupplierCapability.HOTELS]));
    registry.register(createFakeSupplier("healthy-supplier", [SupplierCapability.HOTELS]));

    const response = await dispatcher.dispatch({
      capability: SupplierCapability.HOTELS,
      operation: SupplierOperation.SEARCH,
      call: async (supplier) => {
        if (supplier.code === "failing-supplier") return err(new InternalError("down"));
        return ok(`results-from-${supplier.code}`);
      },
    });

    expect(response.supplierCode).toBe("healthy-supplier");
    expect(isOk(response.result)).toBe(true);
  });

  it("only ever routes to suppliers registered for the requested capability", async () => {
    const { registry, dispatcher } = buildDispatcher();
    registry.register(createFakeSupplier("hotel-only", [SupplierCapability.HOTELS]));
    registry.register(createFakeSupplier("flight-only", [SupplierCapability.FLIGHTS]));

    const attempted: string[] = [];
    await dispatcher.dispatch({
      capability: SupplierCapability.FLIGHTS,
      operation: SupplierOperation.SEARCH,
      call: async (supplier) => {
        attempted.push(supplier.code);
        return ok("data");
      },
    });

    expect(attempted).toEqual(["flight-only"]);
  });

  it("respects preferredSupplierCode, ignoring other capability-matching suppliers", async () => {
    const { registry, dispatcher } = buildDispatcher();
    registry.register(createFakeSupplier("a", [SupplierCapability.HOTELS]));
    registry.register(createFakeSupplier("b", [SupplierCapability.HOTELS]));

    const response = await dispatcher.dispatch({
      capability: SupplierCapability.HOTELS,
      operation: SupplierOperation.DETAILS,
      call: async (supplier) => ok(supplier.code),
      preferredSupplierCode: "b",
    });

    expect(response.supplierCode).toBe("b");
  });

  it("returns NotFoundError when preferredSupplierCode doesn't match any capability-eligible supplier", async () => {
    const { registry, dispatcher } = buildDispatcher();
    registry.register(createFakeSupplier("a", [SupplierCapability.HOTELS]));

    const response = await dispatcher.dispatch({
      capability: SupplierCapability.HOTELS,
      operation: SupplierOperation.DETAILS,
      call: async () => ok("unreachable"),
      preferredSupplierCode: "nonexistent",
    });

    expect(isErr(response.result)).toBe(true);
  });
});
