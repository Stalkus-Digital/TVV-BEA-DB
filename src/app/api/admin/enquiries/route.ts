import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { createAdminEnquiryHandler, listAdminEnquiriesHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await listAdminEnquiriesHandler({
    status: (searchParams.get("status") as never) ?? undefined,
    type: (searchParams.get("type") as never) ?? undefined,
    assignedToUserId: searchParams.get("assignedToUserId") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await createAdminEnquiryHandler(body, null);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
