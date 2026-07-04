import { api, expectSuccess } from "./api-client";
import { countryPayload, destinationPayload, hotelInventoryPayload, packagePayload } from "../fixtures/payloads";

export interface BaseScenario {
  countryId: string;
  destinationId: string;
  inventoryItemId: string;
  packageId: string;
}

/**
 * Builds the same country → destination → hotel → package chain every
 * sprint's manual `curl` verification built by hand — the shared
 * prerequisite for any Quote/Booking integration test. Each call produces
 * fresh, uniquely-named records (see fixtures/payloads.ts's `unique()`), so
 * scenarios never collide across test files even though they share one
 * running server's in-memory store.
 */
export async function buildBaseScenario(): Promise<BaseScenario> {
  const country = expectSuccess<{ id: string }>((await api.post("/api/geography/countries").send(countryPayload())).body);

  const destination = expectSuccess<{ id: string }>(
    (await api.post("/api/destinations").send(destinationPayload(country.id))).body
  );

  const inventoryItem = expectSuccess<{ id: string }>(
    (await api.post("/api/inventory").send(hotelInventoryPayload(destination.id))).body
  );

  const pkg = expectSuccess<{ id: string }>(
    (await api.post("/api/packages").send(packagePayload(destination.id))).body
  );

  return { countryId: country.id, destinationId: destination.id, inventoryItemId: inventoryItem.id, packageId: pkg.id };
}

export interface ApprovedQuoteScenario extends BaseScenario {
  quoteId: string;
}

/** Extends buildBaseScenario() through a sent-and-approved Quote — the prerequisite for any Booking test. */
export async function buildApprovedQuoteScenario(): Promise<ApprovedQuoteScenario> {
  const base = await buildBaseScenario();
  const { quotePayload, quoteItemPayload } = await import("../fixtures/payloads");

  const quote = expectSuccess<{ id: string }>(
    (await api.post("/api/quotes").send(quotePayload(base.destinationId, { packageId: base.packageId }))).body
  );

  await api.post(`/api/quotes/${quote.id}/items`).send(quoteItemPayload({ packageId: base.packageId, unitPrice: 30_000, quantity: 2 }));
  await api.post(`/api/quotes/${quote.id}/send`).send({});
  await api.post(`/api/quotes/${quote.id}/approve`).send({});

  return { ...base, quoteId: quote.id };
}
