import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getDestinationBreadcrumbsHandler } from "@/modules/destination";
import { isErr } from "@/shared/types";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getDestinationBreadcrumbsHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
