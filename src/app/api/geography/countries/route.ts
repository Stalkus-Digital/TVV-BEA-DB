import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { createCountryHandler, listCountriesHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";

import { Country } from "country-state-city";

export async function GET() {
  const allCountries = Country.getAllCountries().map((c) => ({
    id: c.isoCode, // Use isoCode as ID for the cascading logic
    name: c.name,
    isoCode: c.isoCode,
  }));

  return jsonSuccess({
    items: allCountries,
    page: 1,
    pageSize: allCountries.length,
    total: allCountries.length,
    totalPages: 1,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await createCountryHandler(body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
