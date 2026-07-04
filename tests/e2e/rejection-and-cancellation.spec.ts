import { expect, test } from "./fixtures";

/** The two "unhappy but legitimate" business outcomes — a declined quote and a cancelled booking — each their own real flow, not just an error-path unit check. */
test("a customer can decline a quote, and it never becomes bookable", async ({ authedRequest: request }) => {
  const unique = `e2e-reject-${Date.now()}`;
  const country = await (await request.post("/api/geography/countries", { data: { name: `Country ${unique}`, isoCode: "IN" } })).json();
  const destination = await (await request.post("/api/destinations", { data: { name: `Destination ${unique}`, countryId: country.data.id } })).json();

  const quote = await (
    await request.post("/api/quotes", {
      data: { title: `Quote ${unique}`, destinationId: destination.data.id, travelerDetails: { leadTraveler: { name: "T", email: "t@example.com" }, adults: 1 } },
    })
  ).json();

  await request.post(`/api/quotes/${quote.data.id}/send`, { data: {} });
  const rejected = await (await request.post(`/api/quotes/${quote.data.id}/reject`, { data: { reason: "Chose a competitor" } })).json();
  expect(rejected.data.status).toBe("REJECTED");
  expect(rejected.data.rejectionReason).toBe("Chose a competitor");

  const bookingAttempt = await request.post("/api/bookings", { data: { quoteId: quote.data.id } });
  expect(bookingAttempt.status()).toBe(409);
});

test("a confirmed-but-unpaid booking can be cancelled with a reason recorded", async ({ authedRequest: request }) => {
  const unique = `e2e-cancel-${Date.now()}`;
  const country = await (await request.post("/api/geography/countries", { data: { name: `Country ${unique}`, isoCode: "IN" } })).json();
  const destination = await (await request.post("/api/destinations", { data: { name: `Destination ${unique}`, countryId: country.data.id } })).json();

  const quote = await (
    await request.post("/api/quotes", {
      data: { title: `Quote ${unique}`, destinationId: destination.data.id, travelerDetails: { leadTraveler: { name: "T", email: "t2@example.com" }, adults: 1 } },
    })
  ).json();
  await request.post(`/api/quotes/${quote.data.id}/items`, { data: { title: "Item", quantity: 1, unitPrice: 5000 } });
  await request.post(`/api/quotes/${quote.data.id}/send`, { data: {} });
  await request.post(`/api/quotes/${quote.data.id}/approve`, { data: {} });

  const booking = await (await request.post("/api/bookings", { data: { quoteId: quote.data.id } })).json();
  await request.post(`/api/bookings/${booking.data.id}/confirm`, { data: {} });

  const cancelled = await (await request.post(`/api/bookings/${booking.data.id}/cancel`, { data: { reason: "Customer changed travel dates" } })).json();
  expect(cancelled.data.status).toBe("CANCELLED");
  expect(cancelled.data.cancellationReason).toBe("Customer changed travel dates");

  const timeline = await (await request.get(`/api/bookings/${booking.data.id}/timeline`)).json();
  expect(timeline.data.some((entry: { event: string }) => entry.event === "CANCELLED")).toBe(true);
});
