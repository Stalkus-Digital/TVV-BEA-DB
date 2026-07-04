import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { getMeHandler, updateMeHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const result = await getMeHandler(context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function PATCH(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const body = await request.json().catch(() => null);
  const result = await updateMeHandler(context, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
