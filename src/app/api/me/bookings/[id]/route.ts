import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { getMyBookingHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = readAuthContextFromHeaders(request.headers);
  const { id } = await params;
  const result = await getMyBookingHandler(context, id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
