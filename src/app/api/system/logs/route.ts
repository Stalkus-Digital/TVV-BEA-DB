import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getSystemLogsHandler } from "@/modules/observability";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = getSystemLogsHandler({
    level: searchParams.get("level"),
    scope: searchParams.get("scope"),
    limit: searchParams.get("limit"),
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
