import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { listAdminEnquiriesHandler } from "@/modules/customer";
import type { EnquiryStatus, EnquiryType } from "@/modules/customer";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await listAdminEnquiriesHandler({
    status: (searchParams.get("status") as EnquiryStatus) ?? undefined,
    type: (searchParams.get("type") as EnquiryType) ?? undefined,
    assignedToUserId: searchParams.get("assignedToUserId") ?? undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
