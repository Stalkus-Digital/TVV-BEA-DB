import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { createStateHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";
import { State } from "country-state-city";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get("countryId") || undefined;
  
  if (!countryId) {
    return jsonSuccess([]);
  }

  const states = State.getStatesOfCountry(countryId).map((s) => ({
    id: s.isoCode, // Use isoCode as ID to cascade to cities
    countryId: s.countryCode,
    name: s.name,
    isoCode: s.isoCode,
  }));

  return jsonSuccess(states);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await createStateHandler(body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
