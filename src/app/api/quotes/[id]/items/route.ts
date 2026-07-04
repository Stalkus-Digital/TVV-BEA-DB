import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { addQuoteItemHandler, listQuoteItemsHandler } from "@/modules/quote";
import { isErr } from "@/shared/types";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await listQuoteItemsHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = await addQuoteItemHandler(id, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
