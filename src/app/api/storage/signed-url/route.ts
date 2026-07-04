import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { signedUrlHandler } from "@/modules/storage";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const { searchParams } = new URL(request.url);
  const result = await signedUrlHandler(
    context,
    searchParams.get("category"),
    searchParams.get("key"),
    searchParams.get("ownerId"),
    searchParams.get("ttlSeconds")
  );
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
