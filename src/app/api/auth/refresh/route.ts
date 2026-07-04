import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { refreshHandler } from "@/modules/auth";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const meta = {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    deviceInfo: request.headers.get("user-agent"),
  };
  const result = await refreshHandler(body, meta);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
