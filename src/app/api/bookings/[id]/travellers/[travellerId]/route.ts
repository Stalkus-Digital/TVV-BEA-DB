import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { removeTravellerHandler } from "@/modules/booking";
import { isErr } from "@/shared/types";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; travellerId: string }> }) {
  const { id, travellerId } = await params;
  const result = await removeTravellerHandler(id, travellerId);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
