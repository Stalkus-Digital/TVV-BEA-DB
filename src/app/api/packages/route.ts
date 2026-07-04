import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { createPackageHandler, listPackagesHandler, type PackageSourceType, type PackageStatus } from "@/modules/package";
import { isErr } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const featuredParam = searchParams.get("isTemplate");
  const status = searchParams.get("status");
  const sourceType = searchParams.get("sourceType");
  const result = await listPackagesHandler({
    destinationId: searchParams.get("destinationId") ?? undefined,
    status: (status as PackageStatus) ?? undefined,
    sourceType: (sourceType as PackageSourceType) ?? undefined,
    isTemplate: featuredParam ? featuredParam === "true" : undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = await createPackageHandler(body);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value, { status: 201 });
}
