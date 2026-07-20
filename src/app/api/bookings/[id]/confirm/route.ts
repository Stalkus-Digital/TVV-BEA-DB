import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { confirmBookingHandler } from "@/modules/booking";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = readAuthContextFromHeaders(request.headers);
  const result = await confirmBookingHandler(id, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
