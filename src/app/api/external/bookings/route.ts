import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getBookingService } from "@/modules/booking";
import { getQuoteService, getQuoteItemService } from "@/modules/quote";
import { getInventoryService } from "@/modules/inventory";
import { getPackageService } from "@/modules/package";
import { getDestinationService } from "@/modules/destination";
import { isErr } from "@/shared/types";

function normalizeBookingType(raw: unknown): "PACKAGE" | "HOTEL" | "ACTIVITY" {
  const value = String(raw ?? "PACKAGE").toUpperCase();
  if (value === "HOTEL") return "HOTEL";
  if (value === "ACTIVITY") return "ACTIVITY";
  return "PACKAGE";
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "unknown") return null;
  return trimmed;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonError(new Error("Invalid JSON body"));

  const payload = body as Record<string, unknown>;
  const bookingType = normalizeBookingType(payload.bookingType);
  const packageId = asNonEmptyString(payload.packageId);
  const inventoryItemId =
    asNonEmptyString(payload.inventoryItemId) ??
    asNonEmptyString(payload.hotelId) ??
    asNonEmptyString(payload.activityId);

  const notesPayload = {
    ...payload,
    isExternalWebsiteBooking: true,
    externalBookingType: bookingType,
  };
  const internalNotes = JSON.stringify(notesPayload);

  let destinationId = asNonEmptyString(payload.destinationId);

  if (!destinationId && inventoryItemId) {
    const inventory = await getInventoryService().getById(inventoryItemId);
    if (!isErr(inventory)) {
      destinationId = asNonEmptyString(inventory.value.destinationId);
    }
  }

  if (!destinationId && packageId) {
    const pkg = await getPackageService().getById(packageId);
    if (!isErr(pkg)) {
      destinationId = asNonEmptyString(pkg.value.destinationId);
    }
  }

  if (!destinationId) {
    const destinations = await getDestinationService().list({ page: 1, pageSize: 1 });
    if (isErr(destinations) || destinations.value.items.length === 0) {
      return jsonError(new Error("No destination available for website booking"));
    }
    destinationId = destinations.value.items[0].id;
  }

  // 1. Create a draft Quote (Booking requires sourceQuoteId)
  const quoteInput = {
    title: `Website Booking - ${payload.contactName ?? "Guest"}`,
    destinationId,
    packageId,
    travelerDetails: {
      primaryContact: {
        name: payload.contactName ?? "Guest",
        email: payload.email ?? "unknown@example.com",
        phone: payload.phone ?? "",
      },
      adults: Number(payload.guests ?? 1),
      children: 0,
      infants: 0,
    },
    currency: payload.currency ?? "INR",
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
          unitPrice: Number(payload.total ?? 0),
        });
        if (isErr(added)) return jsonError(added.error);
      }
    }
  }

  if (inventoryItemId) {
    const inventory = await getInventoryService().getById(inventoryItemId);
    if (!isErr(inventory)) {
      const unitPrice =
        Number(payload.total ?? 0) / Math.max(1, Number(payload.guests ?? 1) || 1);
      const added = await getQuoteItemService().add(quote.id, {
        packageId: null,
        inventoryItemId,
        title: inventory.value.title,
        description: `Website ${inventory.value.kind.toLowerCase()} booking`,
        quantity: Number(payload.guests ?? 1) || 1,
        unitPrice,
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
