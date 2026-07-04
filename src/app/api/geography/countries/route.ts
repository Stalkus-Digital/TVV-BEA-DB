import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { createCountryHandler, listCountriesHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";

export async function GET() {
  const result = await listCountriesHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await createCountryHandler(body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
