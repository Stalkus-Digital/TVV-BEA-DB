import { describe, expect, it } from "vitest";
import { api, expectSuccess } from "../helpers/api-client";

describe("Supplier API (read-only ops surface)", () => {
  it("GET /api/suppliers lists all three placeholder adapters", async () => {
    const response = await api.get("/api/suppliers");
    const data = expectSuccess<{ code: string }[]>(response.body);
    expect(data.map((s) => s.code).sort()).toEqual(["ferry", "manual", "tripjack"]);
  });

  it("GET /api/suppliers?capability=FERRIES filters dynamically, not via a hardcoded list", async () => {
    const response = await api.get("/api/suppliers?capability=FERRIES");
    const data = expectSuccess<{ code: string }[]>(response.body);
    expect(data.map((s) => s.code)).toEqual(["ferry"]);
  });

  it("GET /api/suppliers/:code returns the named supplier's record", async () => {
    const response = await api.get("/api/suppliers/manual");
    expect(response.status).toBe(200);
    expect(expectSuccess<{ code: string }>(response.body).code).toBe("manual");
  });

  it("GET /api/suppliers/:code returns 404 for an unknown code", async () => {
    const response = await api.get("/api/suppliers/nonexistent");
    expect(response.status).toBe(404);
  });

  /**
   * Updated for Sprint 17 (Live TripJack Search): `.env.test` now sets
   * fake-but-present `TRIPJACK_*` values (see .env.test), so
   * `TripJackConfig.isConfigured()` is true here — this suite hits a real
   * `next start` process with no MSW mocking, so the health check's login
   * attempt goes out over the real network to a deliberately fake,
   * non-resolving domain and correctly reports "configured but
   * unreachable," not the old "NOT_CONFIGURED" case (that's still exactly
   * what Ferry/Manual report, since neither has real config wiring at all).
   */
  it("GET /api/suppliers/tripjack/health reports configured=true/authenticated=false (real network unreachable), distinct from Ferry/Manual's generic placeholder message", async () => {
    const [tripjack, ferry] = await Promise.all([api.get("/api/suppliers/tripjack/health"), api.get("/api/suppliers/ferry/health")]);
    const tripjackHealth = expectSuccess<{ healthy: boolean; message: string }>(tripjack.body);
    const ferryHealth = expectSuccess<{ healthy: boolean; message: string }>(ferry.body);

    expect(tripjackHealth.healthy).toBe(false);
    expect(tripjackHealth.message).toMatch(/configured=true/);
    expect(tripjackHealth.message).toMatch(/authenticated=false/);
    expect(tripjackHealth.message).not.toMatch(/NOT_CONFIGURED/);
    expect(ferryHealth.message).toMatch(/placeholder/i);
  });
});
