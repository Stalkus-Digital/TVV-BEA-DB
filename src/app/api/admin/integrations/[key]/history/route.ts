import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { getConnectionHistoryHandler } from "@/modules/integrations";
import { isErr } from "@/shared/types";

type Params = { params: Promise<{ key: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { key } = await params;
  const context = readAuthContextFromHeaders(request.headers);

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  const result = await getConnectionHistoryHandler(context, decodeURIComponent(key), limit, offset);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
