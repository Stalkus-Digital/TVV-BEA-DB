import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { clonePackageHandler } from "@/modules/package";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const result = await clonePackageHandler(id, body ?? {});
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
