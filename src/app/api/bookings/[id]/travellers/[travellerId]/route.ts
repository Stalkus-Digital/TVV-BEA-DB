import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { removeTravellerHandler, updateTravellerHandler } from "@/modules/booking";
import { isErr } from "@/shared/types";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; travellerId: string }> }) {
  const { id, travellerId } = await params;
  const body = await request.json().catch(() => null);
  const context = readAuthContextFromHeaders(request.headers);
  const result = await updateTravellerHandler(id, travellerId, body, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; travellerId: string }> }) {
  const { id, travellerId } = await params;
  const context = readAuthContextFromHeaders(request.headers);
  const result = await removeTravellerHandler(id, travellerId, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
