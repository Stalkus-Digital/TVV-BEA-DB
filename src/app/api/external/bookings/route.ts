import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getBookingService } from "@/modules/booking";
import { getQuoteService, getQuoteItemService } from "@/modules/quote";
import { getInventoryService } from "@/modules/inventory";
import { getPackageService } from "@/modules/package";
import { isErr } from "@/shared/types";

function normalizeBookingType(raw: unknown): "PACKAGE" | "HOTEL" | "ACTIVITY" {
  const value = String(raw ?? "PACKAGE").toUpperCase();
  if (value === "HOTEL") return "HOTEL";
  if (value === "ACTIVITY") return "ACTIVITY";
  return "PACKAGE";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonError(new Error("Invalid JSON body"));

  const bookingType = normalizeBookingType((body as Record<string, unknown>).bookingType);
  const packageId =
    typeof (body as Record<string, unknown>).packageId === "string"
      ? ((body as Record<string, unknown>).packageId as string)
      : null;
  const inventoryItemId =
    typeof (body as Record<string, unknown>).inventoryItemId === "string"
      ? ((body as Record<string, unknown>).inventoryItemId as string)
      : typeof (body as Record<string, unknown>).hotelId === "string"
        ? ((body as Record<string, unknown>).hotelId as string)
        : typeof (body as Record<string, unknown>).activityId === "string"
          ? ((body as Record<string, unknown>).activityId as string)
          : null;

  const notesPayload = {
    ...(body as Record<string, unknown>),
    isExternalWebsiteBooking: true,
    externalBookingType: bookingType,
  };
  const internalNotes = JSON.stringify(notesPayload);

  // 1. Create a draft Quote (Booking requires sourceQuoteId)
  const quoteInput = {
    title: `Website Booking - ${(body as Record<string, unknown>).contactName ?? "Guest"}`,
    destinationId: (body as Record<string, unknown>).destinationId ?? "unknown",
    packageId: packageId,
    travelerDetails: {
      primaryContact: {
        name: (body as Record<string, unknown>).contactName ?? "Guest",
        email: (body as Record<string, unknown>).email ?? "unknown@example.com",
        phone: (body as Record<string, unknown>).phone ?? "",
      },
      adults: Number((body as Record<string, unknown>).guests ?? 1),
      children: 0,
      infants: 0,
    },
    currency: (body as Record<string, unknown>).currency ?? "INR",
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 86400000 * 30).toISOString(),
    internalNotes,
  };

  const quoteResult = await getQuoteService().create(quoteInput);
  if (isErr(quoteResult)) return jsonError(quoteResult.error);
  const quote = quoteResult.value;

  // 2. Attach real line items when the website sends package / inventory IDs
  //    so Bookings Management kind filters can find the booking.
  if (packageId) {
    const pkg = await getPackageService().getById(packageId);
    if (!isErr(pkg)) {
      // Quote.create already adds a PACKAGE item when basePrice > 0; ensure one exists either way
      const existingItems = await getQuoteItemService().listByQuote(quote.id);
      const hasPackageItem =
        !isErr(existingItems) && existingItems.value.some((item) => item.kind === "PACKAGE" && item.packageId === packageId);
      if (!hasPackageItem) {
        const added = await getQuoteItemService().add(quote.id, {
          packageId,
          inventoryItemId: null,
          title: pkg.value.title,
          description: "Website package booking",
          quantity: 1,
          unitPrice: Number((body as Record<string, unknown>).total ?? 0),
        });
        if (isErr(added)) return jsonError(added.error);
      }
    }
  }

  if (inventoryItemId) {
    const inventory = await getInventoryService().getById(inventoryItemId);
    if (!isErr(inventory)) {
      const added = await getQuoteItemService().add(quote.id, {
        packageId: null,
        inventoryItemId,
        title: inventory.value.title,
        description: `Website ${inventory.value.kind.toLowerCase()} booking`,
        quantity: Number((body as Record<string, unknown>).guests ?? 1) || 1,
        unitPrice: Number((body as Record<string, unknown>).total ?? 0),
      });
      if (isErr(added)) return jsonError(added.error);
    }
  }

  // 3. Approve then convert — createFromQuote requires APPROVED
  const approved = await getQuoteService().approve(quote.id);
  if (isErr(approved)) return jsonError(approved.error);

  const conversionResult = await getBookingService().createFromQuote({
    quoteId: quote.id,
    internalNotes,
  });
  if (isErr(conversionResult)) return jsonError(conversionResult.error);

  return jsonSuccess(conversionResult.value, { status: 201 });
}
