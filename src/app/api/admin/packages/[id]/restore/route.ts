import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/api";
import { restorePackageHandler } from "@/modules/package";
import { isErr } from "@/shared/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const res = await restorePackageHandler(id);
  if (isErr(res)) return jsonError(res.error);
  
  return jsonSuccess(res.value);
}
