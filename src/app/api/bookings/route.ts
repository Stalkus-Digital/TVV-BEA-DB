import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import {
  createBookingHandler,
  listBookingsHandler,
  type BookingStatus,
  type PaymentStatus,
} from "@/modules/booking";
import type { BookingSortDir, BookingSortField } from "@/modules/booking/repositories/booking.repository";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get("sortBy") as BookingSortField | null;
  const sortDir = searchParams.get("sortDir") as BookingSortDir | null;
  const result = await listBookingsHandler({
    status: (searchParams.get("status") as BookingStatus) || undefined,
    paymentStatus: (searchParams.get("paymentStatus") as PaymentStatus) || undefined,
    destinationId: searchParams.get("destinationId") ?? undefined,
    sourceQuoteId: searchParams.get("sourceQuoteId") ?? undefined,
    customerId: searchParams.get("customerId") ?? undefined,
    hasItemKind: searchParams.get("hasItemKind") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    sortBy: sortBy || undefined,
    sortDir: sortDir || undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const context = readAuthContextFromHeaders(request.headers);
  const result = await createBookingHandler(body, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
