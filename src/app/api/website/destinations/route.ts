import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { listWebsiteDestinationsHandler } from "@/modules/website";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await listWebsiteDestinationsHandler({
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
