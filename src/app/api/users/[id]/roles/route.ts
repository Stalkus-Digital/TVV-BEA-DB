import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { assignRoleHandler, readAuthContextFromHeaders } from "@/modules/auth";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = readAuthContextFromHeaders(request.headers);
  const body = await request.json().catch(() => null);
  const result = await assignRoleHandler(id, body, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
