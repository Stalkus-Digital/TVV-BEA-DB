import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { archiveDestinationHandler, getDestinationHandler, updateDestinationHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await getDestinationHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = await updateDestinationHandler(id, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const result = await archiveDestinationHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
