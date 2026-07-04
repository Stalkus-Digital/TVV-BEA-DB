import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { mswServer } from "../../mocks/server";
import { err, isErr, isOk, ok } from "@/shared/types";
import { UnauthorizedError } from "@/shared/errors";
import { createTestLogger } from "../../helpers/test-logger";
import { TripJackClient } from "@/modules/supplier/adapters/tripjack/client/tripjack.client";
import { TripJackErrorHandler } from "@/modules/supplier/adapters/tripjack/services/tripjack-error-handler";
import { TripJackResponseParser } from "@/modules/supplier/adapters/tripjack/services/tripjack-response-parser";
import type { TripJackAuth } from "@/modules/supplier/adapters/tripjack/services/tripjack-auth.service";
import { fakeTripJackConfig, TEST_API_URL } from "./fake-tripjack-config";

function fakeAuth(token = "test-token"): TripJackAuth {
  return { getToken: async () => ok(token), invalidate: () => {} } as unknown as TripJackAuth;
}

function buildClient(auth: TripJackAuth = fakeAuth()) {
  return new TripJackClient(fakeTripJackConfig(), auth, new TripJackErrorHandler(), new TripJackResponseParser(), createTestLogger());
}

describe("TripJackClient", () => {
  beforeAll(() => mswServer.listen({ onUnhandledRequest: "error" }));
  afterEach(() => mswServer.resetHandlers());
  afterAll(() => mswServer.close());

  it("searchHotels returns parsed results on success", async () => {
    mswServer.use(
      http.post(`${TEST_API_URL}/hotels/search`, () =>
        HttpResponse.json({ results: [{ hotelId: "H1", traceId: "T1", name: "Test Hotel", starRating: 4, address: "Somewhere", nightlyRate: 5000, currency: "INR" }] })
      )
    );
    const result = await buildClient().searchHotels({ cityCode: "GOI", checkIn: "2026-01-01", checkOut: "2026-01-03", rooms: [{ adults: 2 }] });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.results).toHaveLength(1);
  });

  it("searchHotels returns ValidationError when the response is missing required fields", async () => {
    mswServer.use(http.post(`${TEST_API_URL}/hotels/search`, () => HttpResponse.json({ notResults: [] })));
    const result = await buildClient().searchHotels({ cityCode: "GOI", checkIn: "x", checkOut: "y", rooms: [] });
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error.name).toBe("ValidationError");
  });

  it("getHotelDetails returns parsed details", async () => {
    mswServer.use(
      http.post(`${TEST_API_URL}/hotels/details`, () =>
        HttpResponse.json({ hotelId: "H1", traceId: "T1", name: "Test Hotel", starRating: 4, address: "Somewhere", nightlyRate: 5000, currency: "INR", amenities: ["wifi"] })
      )
    );
    const result = await buildClient().getHotelDetails({ hotelId: "H1", traceId: "T1" });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.amenities).toEqual(["wifi"]);
  });

  it("searchFlights returns parsed results on success", async () => {
    mswServer.use(
      http.post(`${TEST_API_URL}/flights/search`, () =>
        HttpResponse.json({
          results: [{ resultIndex: "R1", traceId: "T1", airline: "AI", flightNumber: "101", origin: "DEL", destination: "BOM", departureTime: "x", arrivalTime: "y", fare: 4000, currency: "INR" }],
        })
      )
    );
    const result = await buildClient().searchFlights({ origin: "DEL", destination: "BOM", departureDate: "2026-01-01", adults: 1 });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.results).toHaveLength(1);
  });

  it("getFlightDetails returns parsed details", async () => {
    mswServer.use(
      http.post(`${TEST_API_URL}/flights/details`, () =>
        HttpResponse.json({ resultIndex: "R1", traceId: "T1", airline: "AI", flightNumber: "101", origin: "DEL", destination: "BOM", departureTime: "x", arrivalTime: "y", fare: 4000, currency: "INR", refundable: true })
      )
    );
    const result = await buildClient().getFlightDetails({ resultIndex: "R1", traceId: "T1" });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.refundable).toBe(true);
  });

  it("getFareRules returns parsed rules", async () => {
    mswServer.use(http.post(`${TEST_API_URL}/flights/fare-rules`, () => HttpResponse.json({ resultIndex: "R1", rules: ["non-refundable"] })));
    const result = await buildClient().getFareRules({ resultIndex: "R1", traceId: "T1" });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.rules).toEqual(["non-refundable"]);
  });

  it("getSsrOptions returns parsed options", async () => {
    mswServer.use(http.post(`${TEST_API_URL}/flights/ssr`, () => HttpResponse.json({ options: [{ code: "MEAL", description: "Veg meal" }] })));
    const result = await buildClient().getSsrOptions({ resultIndex: "R1", traceId: "T1", paxId: "P1" });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.options).toHaveLength(1);
  });

  it("getSeatMap returns parsed seats", async () => {
    mswServer.use(http.post(`${TEST_API_URL}/flights/seat-map`, () => HttpResponse.json({ seats: [{ seatNumber: "12A", available: true }] })));
    const result = await buildClient().getSeatMap({ resultIndex: "R1", traceId: "T1", segmentIndex: 0 });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.seats[0].seatNumber).toBe("12A");
  });

  it("propagates an auth failure without ever calling the search endpoint", async () => {
    let searchCalled = false;
    mswServer.use(
      http.post(`${TEST_API_URL}/hotels/search`, () => {
        searchCalled = true;
        return HttpResponse.json({ results: [] });
      })
    );
    const failingAuth = { getToken: async () => err(new UnauthorizedError("no creds")), invalidate: () => {} } as unknown as TripJackAuth;
    const result = await buildClient(failingAuth).searchHotels({ cityCode: "GOI", checkIn: "x", checkOut: "y", rooms: [] });
    expect(isErr(result)).toBe(true);
    expect(searchCalled).toBe(false);
  });

  it("maps a non-2xx response to an AppError via TripJackErrorHandler", async () => {
    mswServer.use(http.post(`${TEST_API_URL}/hotels/search`, () => HttpResponse.json({ message: "bad request" }, { status: 400 })));
    const result = await buildClient().searchHotels({ cityCode: "GOI", checkIn: "x", checkOut: "y", rooms: [] });
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error.name).toBe("ValidationError");
  });

  it("book() still throws NotImplementedError — untouched by this sprint", async () => {
    await expect(buildClient().book({})).rejects.toThrow(/not implemented/i);
  });

  it("cancel() still throws NotImplementedError — untouched by this sprint", async () => {
    await expect(buildClient().cancel({})).rejects.toThrow(/not implemented/i);
  });
});
