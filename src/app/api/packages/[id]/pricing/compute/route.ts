import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { computePackagePriceHandler } from "@/modules/package";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = await computePackagePriceHandler(id, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
