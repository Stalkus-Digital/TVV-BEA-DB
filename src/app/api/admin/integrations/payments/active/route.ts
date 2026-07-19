import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { setActivePaymentHandler } from "@/modules/integrations";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const body = await request.json().catch(() => null);
  const result = await setActivePaymentHandler(context, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
