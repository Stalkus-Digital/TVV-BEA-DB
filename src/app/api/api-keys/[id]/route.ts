import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { revokeApiKeyHandler } from "@/modules/auth";
import { isErr } from "@/shared/types";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await revokeApiKeyHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
