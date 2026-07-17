import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { searchWebsitePackagesHandler } from "@/modules/website";
import { isErr } from "@/shared/types";

function numberOrUndefined(value: string | null): number | undefined {
  return value ? Number(value) : undefined;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await searchWebsitePackagesHandler({
    keyword: searchParams.get("keyword") ?? undefined,
    destinationSlug: searchParams.get("destinationSlug") ?? undefined,
    minDurationDays: numberOrUndefined(searchParams.get("minDurationDays")),
    maxDurationDays: numberOrUndefined(searchParams.get("maxDurationDays")),
    minPrice: numberOrUndefined(searchParams.get("minPrice")),
    maxPrice: numberOrUndefined(searchParams.get("maxPrice")),
    categoryId: searchParams.get("categoryId") ?? undefined,
    packageType: searchParams.get("packageType") ?? undefined,
    tripType: searchParams.get("tripType") ?? undefined,
    page: numberOrUndefined(searchParams.get("page")),
    pageSize: numberOrUndefined(searchParams.get("pageSize")),
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
