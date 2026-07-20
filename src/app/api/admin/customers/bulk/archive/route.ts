import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { bulkArchiveAdminCustomersHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest) {
  const context = readAuthContextFromHeaders(request.headers);
  const body = await request.json().catch(() => null);
  const result = await bulkArchiveAdminCustomersHandler(body, context);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
