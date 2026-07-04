import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { sendQuoteHandler } from "@/modules/quote";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const changeNote = typeof body?.changeNote === "string" ? body.changeNote : null;
  const result = await sendQuoteHandler(id, changeNote);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
