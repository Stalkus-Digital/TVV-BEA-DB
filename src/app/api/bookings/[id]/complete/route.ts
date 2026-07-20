import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { completeBookingHandler } from "@/modules/booking";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = readAuthContextFromHeaders(request.headers);
  const result = await completeBookingHandler(id, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
