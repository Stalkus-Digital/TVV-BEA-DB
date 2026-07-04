import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders, revokeRoleHandler } from "@/modules/auth";
import { isErr } from "@/shared/types";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; roleId: string }> }) {
  const { id, roleId } = await params;
  const context = readAuthContextFromHeaders(request.headers);
  const result = await revokeRoleHandler(id, roleId, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
