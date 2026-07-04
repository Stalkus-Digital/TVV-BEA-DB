import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { createAirportHandler, listAirportsHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await listAirportsHandler(searchParams.get("cityId") ?? undefined);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await createAirportHandler(body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
