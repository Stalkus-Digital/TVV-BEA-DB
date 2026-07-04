import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { metadataHandler } from "@/modules/storage";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const { searchParams } = new URL(request.url);
  const result = await metadataHandler(context, searchParams.get("category"), searchParams.get("key"), searchParams.get("ownerId"));
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
