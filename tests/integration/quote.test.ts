import { describe, expect, it } from "vitest";
import { api, expectSuccess } from "../helpers/api-client";
import { buildBaseScenario } from "../helpers/scenario-builder";
import { quoteItemPayload, quotePayload } from "../fixtures/payloads";

describe("Quote API — full lifecycle over real HTTP", () => {
  it("create → add items → compute pricing → send → approve → convert", async () => {
    const scenario = await buildBaseScenario();

    const quote = expectSuccess<{ id: string; status: string; quoteNumber: string }>(
      (await api.post("/api/quotes").send(quotePayload(scenario.destinationId, { packageId: scenario.packageId }))).body
    );
    expect(quote.status).toBe("DRAFT");
    expect(quote.quoteNumber).toMatch(/^QT-\d{6}$/);

    await api.post(`/api/quotes/${quote.id}/items`).send(quoteItemPayload({ packageId: scenario.packageId, unitPrice: 30_000, quantity: 2 }));
    await api.post(`/api/quotes/${quote.id}/items`).send(quoteItemPayload({ inventoryItemId: scenario.inventoryItemId, unitPrice: 6_000, quantity: 1 }));

    const pricing = expectSuccess<{ total: number }>((await api.get(`/api/quotes/${quote.id}/pricing`)).body);
    expect(pricing.total).toBe(66_000);

    const sent = expectSuccess<{ status: string; currentVersionId: string }>((await api.post(`/api/quotes/${quote.id}/send`).send({})).body);
    expect(sent.status).toBe("SENT");
    expect(sent.currentVersionId).toBeTruthy();

    const versions = expectSuccess<unknown[]>((await api.get(`/api/quotes/${quote.id}/versions`)).body);
    expect(versions).toHaveLength(1);

    const approved = expectSuccess<{ status: string }>((await api.post(`/api/quotes/${quote.id}/approve`).send({})).body);
    expect(approved.status).toBe("APPROVED");

    const converted = expectSuccess<{ pricing: { total: number } }>((await api.post(`/api/quotes/${quote.id}/convert`).send({})).body);
    expect(converted.pricing.total).toBe(66_000);

    const finalState = expectSuccess<{ status: string; convertedBookingId: string | null }>((await api.get(`/api/quotes/${quote.id}`)).body);
    expect(finalState.status).toBe("CONVERTED");
    expect(finalState.convertedBookingId).toBeNull();
  });

  it("rejects convert before approval with 409 CONFLICT and a message naming the required status", async () => {
    const scenario = await buildBaseScenario();
    const quote = expectSuccess<{ id: string }>((await api.post("/api/quotes").send(quotePayload(scenario.destinationId))).body);
    await api.post(`/api/quotes/${quote.id}/send`).send({});

    const response = await api.post(`/api/quotes/${quote.id}/convert`).send({});
    expect(response.status).toBe(409);
    expect(response.body.error.message).toMatch(/APPROVED/);
  });

  it("rejects a quote item referencing both packageId and inventoryItemId", async () => {
    const scenario = await buildBaseScenario();
    const quote = expectSuccess<{ id: string }>((await api.post("/api/quotes").send(quotePayload(scenario.destinationId))).body);

    const response = await api
      .post(`/api/quotes/${quote.id}/items`)
      .send(quoteItemPayload({ packageId: scenario.packageId, inventoryItemId: scenario.inventoryItemId }));
    expect(response.status).toBe(400);
  });

  it("duplicate() copies items into a fresh DRAFT quote with a new quote number", async () => {
    const scenario = await buildBaseScenario();
    const quote = expectSuccess<{ id: string; quoteNumber: string }>((await api.post("/api/quotes").send(quotePayload(scenario.destinationId))).body);
    await api.post(`/api/quotes/${quote.id}/items`).send(quoteItemPayload());

    const duplicate = expectSuccess<{ id: string; quoteNumber: string; status: string }>((await api.post(`/api/quotes/${quote.id}/duplicate`).send({})).body);
    expect(duplicate.quoteNumber).not.toBe(quote.quoteNumber);
    expect(duplicate.status).toBe("DRAFT");

    const items = expectSuccess<unknown[]>((await api.get(`/api/quotes/${duplicate.id}/items`)).body);
    expect(items).toHaveLength(1);
  });
});
