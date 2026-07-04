import { describe, expect, it } from "vitest";
import { api, expectSuccess } from "../helpers/api-client";
import { buildBaseScenario } from "../helpers/scenario-builder";

describe("Package API — full builder → day → item → pricing → publish → clone flow", () => {
  it("assembles a package with a day and a PINNED hotel item, computes pricing, and publishes it", async () => {
    const scenario = await buildBaseScenario();

    const day = expectSuccess<{ id: string }>(
      (await api.post(`/api/packages/${scenario.packageId}/days`).send({ dayNumber: 1, title: "Arrival Day" })).body
    );

    const itemResponse = await api
      .post(`/api/packages/${scenario.packageId}/days/${day.id}/items`)
      .send({ kind: "HOTEL", resolutionMode: "PINNED", inventoryItemId: scenario.inventoryItemId, title: "Stay at Test Hotel" });
    expect(itemResponse.status).toBe(201);

    const pricingResponse = await api.put(`/api/packages/${scenario.packageId}/pricing`).send({ basePrice: 45_000, currency: "INR", markup: { type: "PERCENTAGE", value: 10 }, discount: null, tax: { type: "PERCENTAGE", value: 5 } });
    expect(pricingResponse.status).toBe(200);

    const computeResponse = await api.post(`/api/packages/${scenario.packageId}/pricing/compute`).send({ adults: 2 });
    const computed = expectSuccess<{ total: number }>(computeResponse.body);
    expect(computed.total).toBe(103_950); // locked-in correct value, see the pricing-calculator unit regression test

    const publishResponse = await api.post(`/api/packages/${scenario.packageId}/publish`).send({});
    const published = expectSuccess<{ status: string; currentVersionId: string }>(publishResponse.body);
    expect(published.status).toBe("PUBLISHED");
    expect(published.currentVersionId).toBeTruthy();
  });

  it("rejects adding the same inventoryItemId to a second day (duplicate-inventory guard)", async () => {
    const scenario = await buildBaseScenario();
    const dayOne = expectSuccess<{ id: string }>((await api.post(`/api/packages/${scenario.packageId}/days`).send({ dayNumber: 1, title: "Day 1" })).body);
    const dayTwo = expectSuccess<{ id: string }>((await api.post(`/api/packages/${scenario.packageId}/days`).send({ dayNumber: 2, title: "Day 2" })).body);

    await api.post(`/api/packages/${scenario.packageId}/days/${dayOne.id}/items`).send({ kind: "HOTEL", resolutionMode: "PINNED", inventoryItemId: scenario.inventoryItemId, title: "First stay" });
    const secondAttempt = await api.post(`/api/packages/${scenario.packageId}/days/${dayTwo.id}/items`).send({ kind: "HOTEL", resolutionMode: "PINNED", inventoryItemId: scenario.inventoryItemId, title: "Duplicate stay" });

    expect(secondAttempt.status).toBe(409);
  });

  it("clone() produces a new package with an auto-disambiguated code/slug", async () => {
    const scenario = await buildBaseScenario();
    const cloneResponse = await api.post(`/api/packages/${scenario.packageId}/clone`).send({});
    expect(cloneResponse.status).toBe(201);
    const clone = expectSuccess<{ id: string; code: string }>(cloneResponse.body);
    expect(clone.id).not.toBe(scenario.packageId);
  });

  it("rule evaluation rejects a pax count below the configured minimum", async () => {
    const scenario = await buildBaseScenario();
    await api.put(`/api/packages/${scenario.packageId}/rules`).send({ minPax: 2, maxPax: null, cancellationTiers: [], paymentTerms: null, refundPolicy: null, bookingWindow: null });

    const evaluation = expectSuccess<{ valid: boolean; violations: string[] }>(
      (await api.post(`/api/packages/${scenario.packageId}/rules/evaluate`).send({ paxCount: 1, travelDate: "2027-01-01" })).body
    );
    expect(evaluation.valid).toBe(false);
  });
});
