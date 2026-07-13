import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getBookingService } from "@/modules/booking";
import { getQuoteService } from "@/modules/quote";
import { getPackageService } from "@/modules/package";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return jsonError(new Error("Invalid JSON body"));

  // 1. Create a dummy Quote first, since Booking requires sourceQuoteId
  // The external website should pass destinationId and optionally packageId.
  const quoteInput = {
    title: `Website Booking - ${body.contactName ?? "Guest"}`,
    destinationId: body.destinationId ?? "unknown",
    packageId: body.packageId ?? null,
    travelerDetails: {
      primaryContact: {
        name: body.contactName ?? "Guest",
        email: body.email ?? "unknown@example.com",
        phone: body.phone ?? "",
      },
      adults: Number(body.guests ?? 1),
      children: 0,
      infants: 0
    },
    currency: body.currency ?? "USD",
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 86400000 * 30).toISOString(),
    internalNotes: JSON.stringify({ ...body, isExternalWebsiteBooking: true, externalBookingType: body.bookingType || "PACKAGE" }) // Store all raw website booking details here
  };

  const quoteResult = await getQuoteService().create(quoteInput);
  if (isErr(quoteResult)) return jsonError(quoteResult.error);
  const quote = quoteResult.value;

  // 2. Convert Quote to Booking
  const bookingInput = {
    amountPaid: body.status === "PAID" ? Number(body.total ?? 0) : 0,
    paymentStatus: body.status === "PAID" ? "PAID" : "PENDING",
    internalNotes: JSON.stringify({ ...body, isExternalWebsiteBooking: true, externalBookingType: body.bookingType || "PACKAGE" })
  };

  const conversionResult = await getBookingService().createFromQuote({
    quoteId: quote.id,
    internalNotes: JSON.stringify({ ...body, isExternalWebsiteBooking: true, externalBookingType: body.bookingType || "PACKAGE" })
  });
  if (isErr(conversionResult)) return jsonError(conversionResult.error);

  return jsonSuccess(conversionResult.value, { status: 201 });
}
