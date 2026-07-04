import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { mswServer } from "../../mocks/server";

/**
 * Predates Sprint 17 (Live TripJack Search), which now does make real
 * `fetch()` calls from `TripJackClient`/`TripJackAuth` — see
 * tests/unit/tripjack/ for those. This test only proves the shared MSW
 * server wiring itself (tests/mocks/server.ts, tests/mocks/handlers.ts)
 * works against a synthetic request; kept as its own narrow test rather
 * than folded into tests/unit/tripjack/, since it's about the test
 * infrastructure, not the TripJack connector.
 */
describe("MSW infrastructure readiness", () => {
  beforeAll(() => mswServer.listen({ onUnhandledRequest: "error" }));
  afterEach(() => mswServer.resetHandlers());
  afterAll(() => mswServer.close());

  it("intercepts a request matching a registered handler and returns the mocked response", async () => {
    const response = await fetch("https://tripjack-api.example.com/authenticate", { method: "POST" });
    const body = await response.json();
    expect(body).toEqual({ status: "SUCCESS", token: "mock-token", expiresIn: 3600 });
  });

  it("an unhandled request is rejected loudly (onUnhandledRequest: 'error'), not silently passed through to the real network", async () => {
    await expect(fetch("https://unregistered-endpoint.example.com/anything")).rejects.toThrow();
  });
});
