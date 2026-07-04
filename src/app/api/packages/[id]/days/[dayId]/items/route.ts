import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { addPackageItemHandler } from "@/modules/package";
import { isErr } from "@/shared/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; dayId: string }> }) {
  const { dayId } = await params;
  const body = await request.json().catch(() => null);
  const result = await addPackageItemHandler(dayId, body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
