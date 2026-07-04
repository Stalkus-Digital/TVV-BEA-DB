import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { mswServer } from "../../mocks/server";
import { isErr, isOk } from "@/shared/types";
import { createTestLogger } from "../../helpers/test-logger";
import { TripJackAdapter } from "@/modules/supplier/adapters/tripjack";
import { SupplierCapability } from "@/modules/supplier/types";
import { TEST_API_URL } from "./fake-tripjack-config";

/**
 * Uses the REAL `TripJackConfig` singleton (via `TripJackAdapter`'s own
 * constructor, which is not injectable) — configured entirely from
 * `.env.test`'s `TRIPJACK_*` values (see .env.test), never a real account.
 */
function buildAdapter(): TripJackAdapter {
  return new TripJackAdapter({ logger: createTestLogger() });
}

describe("TripJackAdapter", () => {
  beforeAll(() => mswServer.listen({ onUnhandledRequest: "error" }));
  afterEach(() => mswServer.resetHandlers());
  afterAll(() => mswServer.close());

  it("capabilities() is unchanged — FLIGHTS and HOTELS", () => {
    expect(buildAdapter().capabilities()).toEqual([SupplierCapability.FLIGHTS, SupplierCapability.HOTELS]);
  });

  it("search() for HOTELS logs in, searches, and returns mapped inventory-shaped results with an encoded referenceId", async () => {
    mswServer.use(
      http.post(`${TEST_API_URL}/auth/login`, () => HttpResponse.json({ token: "tok", expiresInSeconds: 3600 })),
      http.post(`${TEST_API_URL}/hotels/search`, () =>
        HttpResponse.json({ results: [{ hotelId: "ADAPT-H1", traceId: "T1", name: "Beach Resort", starRating: 5, address: "Goa", nightlyRate: 9000, currency: "INR" }] })
      )
    );
    const result = await buildAdapter().search({
      capability: SupplierCapability.HOTELS,
      cityCode: "GOI",
      checkIn: "2026-02-01",
      checkOut: "2026-02-03",
      rooms: [{ adults: 2 }],
    });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0].referenceId).toBe("HOTEL::ADAPT-H1::T1");
      expect(result.value[0].title).toBe("Beach Resort");
      expect(result.value[0].starRating).toBe(5);
      // TripJack DTO -> Inventory Models: only the mapper's clean output is exposed, never raw DTO fields like nightlyRate/currency.
      expect(result.value[0]).not.toHaveProperty("nightlyRate");
    }
  });

  it("search() for FLIGHTS logs in, searches, and returns mapped results", async () => {
    mswServer.use(
      http.post(`${TEST_API_URL}/auth/login`, () => HttpResponse.json({ token: "tok", expiresInSeconds: 3600 })),
      http.post(`${TEST_API_URL}/flights/search`, () =>
        HttpResponse.json({
          results: [{ resultIndex: "ADAPT-R1", traceId: "T1", airline: "AI", flightNumber: "202", origin: "DEL", destination: "GOI", departureTime: "x", arrivalTime: "y", fare: 6000, currency: "INR" }],
        })
      )
    );
    const result = await buildAdapter().search({ capability: SupplierCapability.FLIGHTS, origin: "DEL", destination: "GOI", departureDate: "2026-02-01", adults: 1 });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value[0].referenceId).toBe("FLIGHT::ADAPT-R1::T1");
      expect(result.value[0].originAirportCode).toBe("DEL");
      expect(result.value[0].destinationAirportCode).toBe("GOI");
    }
  });

  it("search() for an unsupported capability throws NotImplementedError", async () => {
    await expect(buildAdapter().search({ capability: SupplierCapability.VISA })).rejects.toThrow(/not implemented/i);
  });

  it("details() for a hotel reference decodes, fetches details, and caches through the Supplier Runtime cache", async () => {
    let detailsCallCount = 0;
    mswServer.use(
      http.post(`${TEST_API_URL}/auth/login`, () => HttpResponse.json({ token: "tok", expiresInSeconds: 3600 })),
      http.post(`${TEST_API_URL}/hotels/details`, () => {
        detailsCallCount += 1;
        return HttpResponse.json({ hotelId: "ADAPT-H2", traceId: "T2", name: "Cached Hotel", starRating: 4, address: "Goa", nightlyRate: 7000, currency: "INR", amenities: ["pool", "wifi"] });
      })
    );
    const adapter = buildAdapter();
    const first = await adapter.details("HOTEL::ADAPT-H2::T2");
    const second = await adapter.details("HOTEL::ADAPT-H2::T2");
    expect(isOk(first)).toBe(true);
    expect(isOk(second)).toBe(true);
    if (isOk(first) && isOk(second)) expect(first.value).toEqual(second.value);
    expect(detailsCallCount).toBe(1);
  });

  it("details() for a flight reference fetches flight details", async () => {
    mswServer.use(
      http.post(`${TEST_API_URL}/auth/login`, () => HttpResponse.json({ token: "tok", expiresInSeconds: 3600 })),
      http.post(`${TEST_API_URL}/flights/details`, () =>
        HttpResponse.json({ resultIndex: "ADAPT-R2", traceId: "T3", airline: "AI", flightNumber: "202", origin: "DEL", destination: "GOI", departureTime: "x", arrivalTime: "y", fare: 6000, currency: "INR", refundable: false })
      )
    );
    const result = await buildAdapter().details("FLIGHT::ADAPT-R2::T3");
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.refundable).toBe(false);
  });

  it("details() rejects a malformed reference", async () => {
    const result = await buildAdapter().details("not-a-valid-reference");
    expect(isErr(result)).toBe(true);
  });

  it("details() rejects a reference with an unknown capability prefix", async () => {
    const result = await buildAdapter().details("CRUISE::X::Y");
    expect(isErr(result)).toBe(true);
  });

  it("health() reports configured=true authenticated=true reachable=true with a latency figure when login succeeds", async () => {
    mswServer.use(http.post(`${TEST_API_URL}/auth/login`, () => HttpResponse.json({ token: "tok", expiresInSeconds: 3600 })));
    const result = await buildAdapter().health();
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.healthy).toBe(true);
      expect(result.value.message).toContain("configured=true");
      expect(result.value.message).toContain("authenticated=true");
      expect(result.value.message).toContain("reachable=true");
      expect(result.value.message).toMatch(/latencyMs=\d+/);
    }
  });

  it("health() reports authenticated=false when login fails, still healthy=false", async () => {
    mswServer.use(http.post(`${TEST_API_URL}/auth/login`, () => HttpResponse.json({ message: "bad creds" }, { status: 400 })));
    const result = await buildAdapter().health();
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.healthy).toBe(false);
      expect(result.value.message).toContain("authenticated=false");
    }
  });

  it("book() still throws NotImplementedError", async () => {
    await expect(buildAdapter().book({ referenceId: "x", contactEmail: "a@b.com" })).rejects.toThrow(/not implemented/i);
  });

  it("cancel() still throws NotImplementedError", async () => {
    await expect(buildAdapter().cancel("BR-1")).rejects.toThrow(/not implemented/i);
  });
});
