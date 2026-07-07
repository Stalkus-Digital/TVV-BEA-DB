import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { updateAdminEnquiryStatusHandler } from "@/modules/customer";
import { isErr } from "@/shared/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = await updateAdminEnquiryStatusHandler(id, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
