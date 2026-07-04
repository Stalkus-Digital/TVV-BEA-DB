import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getPackageBySlugHandler } from "@/modules/package";
import { isErr } from "@/shared/types";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPackageBySlugHandler(slug);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
