import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { buildAIPackageHandler } from "@/modules/package";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await buildAIPackageHandler(body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
