import { describe, expect, it } from "vitest";
import { api, expectSuccess } from "../helpers/api-client";
import { countryPayload, destinationPayload } from "../fixtures/payloads";

describe("Destination + Geography API", () => {
  it("full geography chain: create a country, then a destination under it", async () => {
    const country = expectSuccess<{ id: string }>((await api.post("/api/geography/countries").send(countryPayload())).body);
    const destination = expectSuccess<{ id: string; slug: string; status: string }>(
      (await api.post("/api/destinations").send(destinationPayload(country.id))).body
    );
    expect(destination.status).toBe("DRAFT");
    expect(destination.slug).toBeTruthy();
  });

  it("rejects a duplicate slug with 409 CONFLICT", async () => {
    const country = expectSuccess<{ id: string }>((await api.post("/api/geography/countries").send(countryPayload())).body);
    const payload = destinationPayload(country.id, { name: "Duplicate Slug Test" });
    const first = await api.post("/api/destinations").send(payload);
    expect(first.status).toBe(201);

    const second = await api.post("/api/destinations").send(payload);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("CONFLICT");
  });

  it("GET /api/destinations/:id/breadcrumbs returns the chain root-first", async () => {
    const country = expectSuccess<{ id: string }>((await api.post("/api/geography/countries").send(countryPayload())).body);
    const root = expectSuccess<{ id: string; name: string }>((await api.post("/api/destinations").send(destinationPayload(country.id, { name: "Breadcrumb Root" }))).body);
    const leaf = expectSuccess<{ id: string }>(
      (await api.post("/api/destinations").send(destinationPayload(country.id, { name: "Breadcrumb Leaf", parentDestinationId: root.id }))).body
    );

    const breadcrumbs = expectSuccess<{ name: string }[]>((await api.get(`/api/destinations/${leaf.id}/breadcrumbs`)).body);
    expect(breadcrumbs.map((b) => b.name)).toEqual(["Breadcrumb Root", "Breadcrumb Leaf"]);
  });

  it("GET /api/destinations/:id/nearby returns a sibling under the same parent", async () => {
    const country = expectSuccess<{ id: string }>((await api.post("/api/geography/countries").send(countryPayload())).body);
    const root = expectSuccess<{ id: string }>((await api.post("/api/destinations").send(destinationPayload(country.id, { name: "Nearby Root" }))).body);
    const siblingA = expectSuccess<{ id: string }>((await api.post("/api/destinations").send(destinationPayload(country.id, { name: "Sibling A", parentDestinationId: root.id }))).body);
    await api.post("/api/destinations").send(destinationPayload(country.id, { name: "Sibling B", parentDestinationId: root.id }));

    const nearby = expectSuccess<{ name: string }[]>((await api.get(`/api/destinations/${siblingA.id}/nearby`)).body);
    expect(nearby.some((d) => d.name === "Sibling B")).toBe(true);
  });

  it("PATCH cannot smuggle a parentDestinationId change through the update endpoint", async () => {
    const country = expectSuccess<{ id: string }>((await api.post("/api/geography/countries").send(countryPayload())).body);
    const destination = expectSuccess<{ id: string }>((await api.post("/api/destinations").send(destinationPayload(country.id))).body);

    const patched = await api.patch(`/api/destinations/${destination.id}`).send({ parentDestinationId: "some-other-id" });
    expect(patched.status).toBe(200); // ignored, not rejected — extra unknown fields are simply not applied
    const refetched = expectSuccess<{ parentDestinationId: string | null }>((await api.get(`/api/destinations/${destination.id}`)).body);
    expect(refetched.parentDestinationId).toBeNull();
  });
});
