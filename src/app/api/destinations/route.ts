import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { createDestinationHandler, listDestinationsHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const featuredParam = searchParams.get("featured");
  const result = await listDestinationsHandler({
    countryId: searchParams.get("countryId") ?? undefined,
    stateId: searchParams.get("stateId") ?? undefined,
    cityId: searchParams.get("cityId") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    parentDestinationId: searchParams.get("parentDestinationId") ?? undefined,
    featured: featuredParam ? featuredParam === "true" : undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await createDestinationHandler(body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
