import { describe, expect, it } from "vitest";
import { api, expectSuccess } from "../helpers/api-client";
import { hotelInventoryPayload } from "../fixtures/payloads";

describe("Inventory API", () => {
  it("POST /api/inventory creates a HOTEL item; GET /api/inventory/:id retrieves it", async () => {
    const createResponse = await api.post("/api/inventory").send(hotelInventoryPayload(null as unknown as string, { destinationId: null }));
    expect(createResponse.status).toBe(201);
    const created = expectSuccess<{ id: string; status: string }>(createResponse.body);
    expect(created.status).toBe("DRAFT");

    const getResponse = await api.get(`/api/inventory/${created.id}`);
    expect(getResponse.status).toBe(200);
  });

  it("rejects an invalid kind with 400 VALIDATION_ERROR", async () => {
    const response = await api.post("/api/inventory").send({ kind: "SPACESHIP", title: "x", details: {} });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("GET /api/inventory/:id returns 404 for an unknown id", async () => {
    const response = await api.get("/api/inventory/00000000-0000-0000-0000-000000000000");
    expect(response.status).toBe(404);
  });

  it("GET /api/inventory?kind=HOTEL filters results to that kind", async () => {
    await api.post("/api/inventory").send(hotelInventoryPayload(null as unknown as string, { destinationId: null }));
    const response = await api.get("/api/inventory?kind=HOTEL");
    const data = expectSuccess<{ items: { kind: string }[] }>(response.body);
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items.every((item) => item.kind === "HOTEL")).toBe(true);
  });

  it("PATCH updates only the provided fields; DELETE removes it", async () => {
    const created = expectSuccess<{ id: string }>((await api.post("/api/inventory").send(hotelInventoryPayload(null as unknown as string, { destinationId: null }))).body);

    const patched = await api.patch(`/api/inventory/${created.id}`).send({ title: "Renamed via PATCH" });
    expect(expectSuccess<{ title: string }>(patched.body).title).toBe("Renamed via PATCH");

    const archived = await api.delete(`/api/inventory/${created.id}`);
    expect(expectSuccess<{ status: string }>(archived.body).status).toBe("ARCHIVED");
  });
});
