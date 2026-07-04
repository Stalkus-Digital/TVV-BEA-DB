import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { removeDestinationFaqHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; faqId: string }> }) {
  const { id, faqId } = await params;
  const result = await removeDestinationFaqHandler(id, faqId);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
