import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { legacyMeHandler } from "@/modules/frontend";
import { isErr } from "@/shared/types";

/**
 * Deliberately NOT in the middleware's public allow-list — same
 * authentication requirement as `/api/auth/me`, whose forwarded-header
 * context this route reads via `readAuthContextFromHeaders`.
 */
export async function GET(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const result = await legacyMeHandler(context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
