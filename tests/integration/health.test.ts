import { describe, expect, it } from "vitest";
import { api, expectSuccess } from "../helpers/api-client";

describe("GET /api/health", () => {
  it("returns 503 (not 200) while any check is degraded — the three placeholder Supplier adapters keep this permanently degraded until Sprint 14", async () => {
    // src/app/api/health/route.ts intentionally maps non-"healthy" overall
    // status to HTTP 503, not 200 — a real, deliberate behavior (so an
    // uptime monitor/load balancer notices), not a bug. The envelope body
    // is still success: true; only the transport status code reflects health.
    const response = await api.get("/api/health");
    expect(response.status).toBe(503);

    const data = expectSuccess<{ status: string; checks: { name: string }[] }>(response.body);
    expect(data.status).toBe("degraded");
    const names = data.checks.map((c) => c.name);
    expect(names).toEqual(
      expect.arrayContaining(["self", "destination", "package", "quote", "booking", "website", "supplier.tripjack", "supplier.ferry", "supplier.manual"])
    );
  });

  it("REGRESSION GUARD: inventory has no health check today (docs/15's finding) — this test documents the gap, not celebrates it", async () => {
    const response = await api.get("/api/health");
    const data = expectSuccess<{ checks: { name: string }[] }>(response.body);
    const names = data.checks.map((c) => c.name);
    // If this assertion ever fails because "inventory" now appears, that's
    // GOOD — docs/15_PRODUCTION_READINESS.md's fix landed. Update this test
    // to assert inclusion instead of exclusion when that happens; don't just
    // delete it.
    expect(names).not.toContain("inventory");
  });
});
