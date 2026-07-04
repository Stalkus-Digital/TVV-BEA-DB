import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { rollbackPackageVersionHandler } from "@/modules/package";
import { isErr } from "@/shared/types";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string; versionId: string }> }) {
  const { id, versionId } = await params;
  const result = await rollbackPackageVersionHandler(id, versionId);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
