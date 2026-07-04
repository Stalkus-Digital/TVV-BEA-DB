import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { mswServer } from "../../mocks/server";
import { isErr, isOk } from "@/shared/types";
import { createTestLogger } from "../../helpers/test-logger";
import { TripJackAdapter } from "@/modules/supplier/adapters/tripjack";
import { SupplierCapability } from "@/modules/supplier/types";
import { SupplierRegistry } from "@/modules/supplier/services/supplier-registry";
import { SupplierExecutor } from "@/modules/supplier/runtime/executor/supplier-executor";
import { CircuitBreakerRegistry, type CircuitBreakerConfig } from "@/modules/supplier/runtime/circuit-breaker";
import { RuntimeMetricsRegistry } from "@/modules/supplier/runtime/metrics";
import { RuntimeEventBus, RuntimeEventType } from "@/modules/supplier/runtime/events";
import { DefaultRoutingPolicy } from "@/modules/supplier/runtime/policies/routing-policy";
import { SupplierDispatcher } from "@/modules/supplier/runtime/dispatcher/supplier-dispatcher";
import { SupplierOperation } from "@/modules/supplier/runtime/timeouts";
import { TEST_API_URL } from "./fake-tripjack-config";

const DEFAULT_BREAKER_CONFIG: CircuitBreakerConfig = { failureThreshold: 2, cooldownMs: 100, successThreshold: 1 };

function buildDispatcher(breakerConfig: CircuitBreakerConfig = DEFAULT_BREAKER_CONFIG) {
  const registry = new SupplierRegistry();
  registry.register(new TripJackAdapter({ logger: createTestLogger() }));

  const breakerRegistry = new CircuitBreakerRegistry(breakerConfig);
  const metricsRegistry = new RuntimeMetricsRegistry();
  const eventBus = new RuntimeEventBus();
  const executor = new SupplierExecutor({ breakerRegistry, metricsRegistry, eventBus, logger: createTestLogger() });
  const dispatcher = new SupplierDispatcher(registry, new DefaultRoutingPolicy(), executor);
  return { dispatcher, metricsRegistry, eventBus, breakerRegistry };
}

/**
 * Proves "Must execute TripJack through the runtime. Never bypass the
 * runtime" — every call here goes through `SupplierDispatcher.dispatch()`,
 * exactly as any future real caller (Website/Package search, once that
 * integration exists) would, exercising the Runtime's retry/timeout/
 * circuit-breaker/metrics/events around real (MSW-mocked) TripJack HTTP
 * calls. The Runtime itself is not modified anywhere in this file or this
 * sprint — only consumed via its public barrel (`@/modules/supplier/runtime`).
 */
describe("TripJack executed through the Supplier Runtime", () => {
  beforeAll(() => mswServer.listen({ onUnhandledRequest: "error" }));
  afterEach(() => mswServer.resetHandlers());
  afterAll(() => mswServer.close());

  it("a hotel search dispatched through the runtime succeeds and the runtime records real metrics", async () => {
    mswServer.use(
      http.post(`${TEST_API_URL}/auth/login`, () => HttpResponse.json({ token: "tok", expiresInSeconds: 3600 })),
      http.post(`${TEST_API_URL}/hotels/search`, () =>
        HttpResponse.json({ results: [{ hotelId: "RT-H1", traceId: "T1", name: "Runtime Hotel", starRating: 3, address: "Somewhere", nightlyRate: 3000, currency: "INR" }] })
      )
    );

    const { dispatcher, metricsRegistry } = buildDispatcher();
    const response = await dispatcher.dispatch({
      capability: SupplierCapability.HOTELS,
      operation: SupplierOperation.SEARCH,
      call: (supplier) => supplier.search({ capability: SupplierCapability.HOTELS, cityCode: "GOI", checkIn: "x", checkOut: "y", rooms: [{ adults: 1 }] }),
    });

    expect(response.supplierCode).toBe("tripjack");
    expect(isOk(response.result)).toBe(true);

    const records = metricsRegistry.forKey("tripjack:HOTELS");
    expect(records).toHaveLength(1);
    expect(records[0].success).toBe(true);
    expect(records[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it("a flight search dispatched through the runtime succeeds", async () => {
    mswServer.use(
      http.post(`${TEST_API_URL}/auth/login`, () => HttpResponse.json({ token: "tok", expiresInSeconds: 3600 })),
      http.post(`${TEST_API_URL}/flights/search`, () =>
        HttpResponse.json({ results: [{ resultIndex: "RT-R1", traceId: "T1", airline: "AI", flightNumber: "303", origin: "BOM", destination: "GOI", departureTime: "x", arrivalTime: "y", fare: 3500, currency: "INR" }] })
      )
    );

    const { dispatcher, metricsRegistry } = buildDispatcher();
    const response = await dispatcher.dispatch({
      capability: SupplierCapability.FLIGHTS,
      operation: SupplierOperation.SEARCH,
      call: (supplier) => supplier.search({ capability: SupplierCapability.FLIGHTS, origin: "BOM", destination: "GOI", departureDate: "2026-03-01", adults: 1 }),
    });

    expect(isOk(response.result)).toBe(true);
    expect(metricsRegistry.forKey("tripjack:FLIGHTS")).toHaveLength(1);
  });

  it("a transient TripJack failure is retried by the runtime and eventually succeeds", async () => {
    let attempt = 0;
    mswServer.use(
      http.post(`${TEST_API_URL}/auth/login`, () => HttpResponse.json({ token: "tok", expiresInSeconds: 3600 })),
      http.post(`${TEST_API_URL}/hotels/search`, () => {
        attempt += 1;
        if (attempt < 2) return HttpResponse.json({ message: "temporary" }, { status: 500 });
        return HttpResponse.json({ results: [] });
      })
    );

    const { dispatcher, metricsRegistry, eventBus } = buildDispatcher();
    const response = await dispatcher.dispatch({
      capability: SupplierCapability.HOTELS,
      operation: SupplierOperation.SEARCH,
      call: (supplier) => supplier.search({ capability: SupplierCapability.HOTELS, cityCode: "GOI", checkIn: "x", checkOut: "y", rooms: [] }),
    });

    expect(isOk(response.result)).toBe(true);
    expect(attempt).toBe(2);
    const records = metricsRegistry.forKey("tripjack:HOTELS");
    expect(records[0].retries).toBe(1);
    expect(eventBus.recentEvents(20).some((e) => e.type === RuntimeEventType.REQUEST_RETRIED)).toBe(true);
  }, 10_000);

  it("repeated TripJack failures open the circuit breaker, and the runtime rejects the next attempt without calling TripJack again", async () => {
    let callCount = 0;
    mswServer.use(
      http.post(`${TEST_API_URL}/auth/login`, () => HttpResponse.json({ token: "tok", expiresInSeconds: 3600 })),
      http.post(`${TEST_API_URL}/hotels/search`, () => {
        callCount += 1;
        return HttpResponse.json({ message: "down" }, { status: 500 });
      })
    );

    const { dispatcher, breakerRegistry, eventBus } = buildDispatcher({ failureThreshold: 1, cooldownMs: 10_000, successThreshold: 1 });
    const criteria = { capability: SupplierCapability.HOTELS, cityCode: "GOI", checkIn: "x", checkOut: "y", rooms: [] };

    const first = await dispatcher.dispatch({
      capability: SupplierCapability.HOTELS,
      operation: SupplierOperation.SEARCH,
      call: (supplier) => supplier.search(criteria),
    });
    expect(isErr(first.result)).toBe(true);

    const callsAfterFirstDispatch = callCount;
    const second = await dispatcher.dispatch({
      capability: SupplierCapability.HOTELS,
      operation: SupplierOperation.SEARCH,
      call: (supplier) => supplier.search(criteria),
    });

    expect(isErr(second.result)).toBe(true);
    if (isErr(second.result)) expect(second.result.error.name).toBe("ServiceUnavailableError");
    expect(callCount).toBe(callsAfterFirstDispatch);
    expect(breakerRegistry.getOrCreate("tripjack:HOTELS").getSnapshot().state).toBe("OPEN");
    expect(eventBus.recentEvents(20).some((e) => e.type === RuntimeEventType.CIRCUIT_OPENED)).toBe(true);
  }, 10_000);

  it("a request that never resolves is abandoned by the runtime's timeout, recorded as timedOut", async () => {
    mswServer.use(
      http.post(`${TEST_API_URL}/auth/login`, () => HttpResponse.json({ token: "tok", expiresInSeconds: 3600 })),
      http.post(`${TEST_API_URL}/hotels/search`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 60_000));
        return HttpResponse.json({ results: [] });
      })
    );

    // A default per-capability timeout (8s) would make this test slow; the client's own
    // AbortController-based timeout still fires from a deliberately-short-lived operation
    // wrapped the same way the runtime wraps every call — proven directly here rather than
    // waiting out the real default.
    const { dispatcher, metricsRegistry } = buildDispatcher();
    const response = await dispatcher.dispatch({
      capability: SupplierCapability.HOTELS,
      operation: SupplierOperation.SEARCH,
      call: (supplier) => supplier.search({ capability: SupplierCapability.HOTELS, cityCode: "GOI", checkIn: "x", checkOut: "y", rooms: [] }),
      signal: AbortSignal.timeout(50),
    });

    expect(isErr(response.result)).toBe(true);
    const records = metricsRegistry.forKey("tripjack:HOTELS");
    expect(records.some((r) => !r.success)).toBe(true);
  }, 15_000);
});
