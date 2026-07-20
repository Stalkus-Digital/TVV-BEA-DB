import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { resetCredentialsHandler } from "@/modules/integrations";
import { isErr } from "@/shared/types";

type Params = { params: Promise<{ key: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { key } = await params;
  const context = readAuthContextFromHeaders(request.headers);
  const result = await resetCredentialsHandler(context, decodeURIComponent(key));
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
