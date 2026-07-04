import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { generateVoucherHandler } from "@/modules/booking";
import { isErr } from "@/shared/types";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await generateVoucherHandler(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
