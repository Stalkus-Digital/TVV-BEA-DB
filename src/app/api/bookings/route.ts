import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { createBookingHandler, listBookingsHandler, type BookingStatus } from "@/modules/booking";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const result = await listBookingsHandler({
    status: (status as BookingStatus) ?? undefined,
    destinationId: searchParams.get("destinationId") ?? undefined,
    sourceQuoteId: searchParams.get("sourceQuoteId") ?? undefined,
    hasItemKind: searchParams.get("hasItemKind") ?? undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await createBookingHandler(body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
