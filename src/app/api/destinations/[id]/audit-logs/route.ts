import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getAuditLogService } from "@/modules/auth";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const pageSize = searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 20;

  const auditService = getAuditLogService();
  const result = await auditService.list({
    page,
    pageSize,
  });

  if (isErr(result)) return jsonError(result.error);

  // Filter for this destination only
  const filtered = {
    ...result.value,
    items: result.value.items.filter(
      (log) =>
        log.details && typeof log.details === "object" && "destinationId" in log.details && log.details.destinationId === params.id
    ),
  };

  return jsonSuccess(filtered);
}
