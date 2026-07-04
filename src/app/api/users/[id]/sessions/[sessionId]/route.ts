import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { revokeUserSessionHandler } from "@/modules/auth";
import { isErr } from "@/shared/types";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { sessionId } = await params;
  const result = await revokeUserSessionHandler(sessionId);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
