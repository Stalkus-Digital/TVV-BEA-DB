import { expect, test } from "./fixtures";

/**
 * The full real-world funnel this entire backend exists to support:
 * catalog setup → customer quote → approval → booking → payment → fulfillment.
 * Every step here is the same sequence each sprint's manual `curl`
 * verification performed by hand — this is that sequence, automated.
 */
test("country → destination → package → quote → booking → payment → ticket → complete", async ({ authedRequest: request }) => {
  const unique = `e2e-${Date.now()}`;

  const country = await (await request.post("/api/geography/countries", { data: { name: `Country ${unique}`, isoCode: "IN" } })).json();
  expect(country.success).toBe(true);

  const destination = await (
    await request.post("/api/destinations", { data: { name: `Destination ${unique}`, countryId: country.data.id } })
  ).json();
  expect(destination.success).toBe(true);

  const inventoryItem = await (
    await request.post("/api/inventory", {
      data: { kind: "HOTEL", title: `Hotel ${unique}`, destinationId: destination.data.id, details: { starRating: 5, address: "1 Beach Road" } },
    })
  ).json();
  expect(inventoryItem.success).toBe(true);

  const pkg = await (
    await request.post("/api/packages", { data: { title: `Package ${unique}`, destinationId: destination.data.id, durationDays: 5, durationNights: 4 } })
  ).json();
  expect(pkg.success).toBe(true);

  await request.put(`/api/packages/${pkg.data.id}/pricing`, {
    data: { basePrice: 50_000, currency: "INR", markup: null, discount: null, tax: null },
  });
  const published = await (await request.post(`/api/packages/${pkg.data.id}/publish`, { data: {} })).json();
  expect(published.data.status).toBe("PUBLISHED");

  // The published package is now visible through the public Website BFF.
  const websitePackages = await (await request.get("/api/website/packages")).json();
  expect(websitePackages.data.items.some((p: { slug: string }) => p.slug === pkg.data.slug)).toBe(true);

  const quote = await (
    await request.post("/api/quotes", {
      data: {
        title: `Quote ${unique}`,
        destinationId: destination.data.id,
        packageId: pkg.data.id,
        travelerDetails: { leadTraveler: { name: "E2E Traveler", email: "e2e@example.com" }, adults: 2 },
      },
    })
  ).json();
  expect(quote.data.status).toBe("DRAFT");

  await request.post(`/api/quotes/${quote.data.id}/items`, { data: { packageId: pkg.data.id, title: `Package ${unique}`, quantity: 2, unitPrice: 50_000 } });
  const sent = await (await request.post(`/api/quotes/${quote.data.id}/send`, { data: {} })).json();
  expect(sent.data.status).toBe("SENT");

  const approved = await (await request.post(`/api/quotes/${quote.data.id}/approve`, { data: {} })).json();
  expect(approved.data.status).toBe("APPROVED");

  const booking = await (await request.post("/api/bookings", { data: { quoteId: quote.data.id } })).json();
  expect(booking.data.status).toBe("DRAFT");
  expect(booking.data.totalAmount).toBe(100_000);

  // The source quote must now be CONVERTED — never modified any other way.
  const quoteAfterBooking = await (await request.get(`/api/quotes/${quote.data.id}`)).json();
  expect(quoteAfterBooking.data.status).toBe("CONVERTED");

  await request.post(`/api/bookings/${booking.data.id}/confirm`, { data: {} });
  const paid = await (
    await request.post(`/api/bookings/${booking.data.id}/payments`, { data: { amount: 100_000, method: "Bank Transfer", status: "PAID" } })
  ).json();
  expect(paid.success).toBe(true);

  const afterPayment = await (await request.get(`/api/bookings/${booking.data.id}`)).json();
  expect(afterPayment.data.status).toBe("PAID");

  const ticketed = await (await request.post(`/api/bookings/${booking.data.id}/ticket`, { data: {} })).json();
  expect(ticketed.data.status).toBe("TICKETED");

  const completed = await (await request.post(`/api/bookings/${booking.data.id}/complete`, { data: {} })).json();
  expect(completed.data.status).toBe("COMPLETED");

  const voucher = await (await request.post(`/api/bookings/${booking.data.id}/voucher`, { data: {} })).json();
  expect(voucher.data.voucherNumber).toMatch(/^VCH-\d{6}$/);

  const invoice = await (await request.post(`/api/bookings/${booking.data.id}/invoice`, { data: {} })).json();
  expect(invoice.data.amountDue).toBe(0);
});
