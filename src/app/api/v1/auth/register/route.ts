import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { legacyRegisterHandler } from "@/modules/frontend";
import { isErr } from "@/shared/types";

/**
 * Unlike Travel OS's own `/api/auth/register` (201, user only, no token),
 * this returns `{access_token, user}` like login does — the frontend's
 * `authActions.register()` requires a token back immediately. See
 * docs/30_FRONTEND_COMPATIBILITY_LAYER.md.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const meta = {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    deviceInfo: request.headers.get("user-agent"),
  };
  const result = await legacyRegisterHandler(body, meta);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
