import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { legacyLoginHandler } from "@/modules/frontend";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const meta = {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    deviceInfo: request.headers.get("user-agent"),
  };
  const result = await legacyLoginHandler(body, meta);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
