import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { isErr } from "@/shared/types";
import { getApiKeyService } from "@/modules/auth/module";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const result = await getApiKeyService().revoke(p.id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
