import { http, HttpResponse } from "msw";

/**
 * This one handler is infrastructure-readiness-only (proven by
 * tests/unit/supplier/msw-readiness.test.ts) — it doesn't match any path
 * TripJackClient actually calls (`/auth/login`, `/hotels/search`, etc.,
 * see tests/unit/tripjack/) and predates Sprint 17 (Live TripJack Search),
 * which replaced 7 of TripJackClient's 9 placeholder methods with real
 * `fetch()` calls. Real TripJack handlers are registered per-test-file
 * under tests/unit/tripjack/ via `mswServer.use(...)`, not added here,
 * since each test needs different response bodies per case (success,
 * error, malformed).
 */
export const handlers = [
  http.post("https://tripjack-api.example.com/authenticate", () => {
    return HttpResponse.json({ status: "SUCCESS", token: "mock-token", expiresIn: 3600 });
  }),
];
