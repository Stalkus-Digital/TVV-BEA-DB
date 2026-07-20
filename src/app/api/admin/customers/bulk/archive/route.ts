import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { bulkArchiveAdminCustomersHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await bulkArchiveAdminCustomersHandler(body, null);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
