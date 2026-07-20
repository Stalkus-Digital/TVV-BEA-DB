import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { listBookingActivityHandler, type BookingActivityCategory } from "@/modules/booking";
import { isErr } from "@/shared/types";

const CATEGORIES = new Set([
  "all",
  "status",
  "payments",
  "notes",
  "documents",
  "travellers",
  "emails",
  "system",
]);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const rawCategory = searchParams.get("category") ?? "all";
  const category = CATEGORIES.has(rawCategory)
    ? (rawCategory as BookingActivityCategory | "all")
    : "all";

  const result = await listBookingActivityHandler(id, {
    category,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 50,
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
