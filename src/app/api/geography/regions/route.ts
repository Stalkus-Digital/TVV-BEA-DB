import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { createRegionHandler, listRegionsHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get("countryId") || undefined;
  const result = await listRegionsHandler(countryId);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await createRegionHandler(body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
