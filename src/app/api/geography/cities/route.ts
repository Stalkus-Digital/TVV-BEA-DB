import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { createCityHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";
import { City } from "country-state-city";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get("countryId") || undefined;
  const stateId = searchParams.get("stateId") || undefined;

  if (!countryId || !stateId) {
    return jsonSuccess([]);
  }

  const cities = City.getCitiesOfState(countryId, stateId).map((c) => ({
    id: c.name, // City API doesn't always have ID, so use name as ID
    countryId: c.countryCode,
    stateId: c.stateCode,
    name: c.name,
  }));

  return jsonSuccess(cities);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await createCityHandler(body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
