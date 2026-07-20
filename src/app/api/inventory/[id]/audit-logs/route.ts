import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getAuditLogService } from "@/modules/auth";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const pageSize = searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 20;

  const result = await getAuditLogService().list({ page, pageSize });
  if (isErr(result)) return jsonError(result.error);

  const filtered = {
    ...result.value,
    items: result.value.items.filter(
      (log) =>
        log.details &&
        typeof log.details === "object" &&
        "inventoryId" in log.details &&
        (log.details as Record<string, unknown>).inventoryId === id
    ),
  };

  return jsonSuccess(filtered);
}
