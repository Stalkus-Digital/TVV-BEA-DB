import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { createApiKeyHandler, listApiKeysHandler } from "@/modules/auth";
import { isErr } from "@/shared/types";

export async function GET() {
  const result = await listApiKeysHandler();
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await createApiKeyHandler(body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
