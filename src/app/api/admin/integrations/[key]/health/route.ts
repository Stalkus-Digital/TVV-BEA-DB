import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { getHealthStatusHandler } from "@/modules/integrations";
import { isErr } from "@/shared/types";

type Params = { params: Promise<{ key: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { key } = await params;
  const context = readAuthContextFromHeaders(request.headers);
  const result = await getHealthStatusHandler(context, decodeURIComponent(key));
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
