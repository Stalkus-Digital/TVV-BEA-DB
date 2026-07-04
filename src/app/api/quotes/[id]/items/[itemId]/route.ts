import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { removeQuoteItemHandler, updateQuoteItemHandler } from "@/modules/quote";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string; itemId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id, itemId } = await params;
  const body = await request.json().catch(() => null);
  const result = await updateQuoteItemHandler(id, itemId, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id, itemId } = await params;
  const result = await removeQuoteItemHandler(id, itemId);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
