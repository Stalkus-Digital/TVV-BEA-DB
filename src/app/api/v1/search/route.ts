import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { searchLegacyHandler } from "@/modules/frontend";
import { isErr } from "@/shared/types";
import { getRateLimiter, getClientIp } from "@/shared/lib/rate-limiter";
import { NextResponse } from "next/server";

function numberOrUndefined(value: string | null): number | undefined {
  return value ? Number(value) : undefined;
}

const searchLimiter = getRateLimiter("search-api-legacy", { windowMs: 60_000, max: 30 });

export async function GET(request: NextRequest) {
  // Rate limit by IP
  const ip = getClientIp(request);
  const limit = await searchLimiter.check(ip);

  if (!limit.allowed) {
    const retryAfterSec = Math.ceil(limit.retryAfterMs / 1000);
    return NextResponse.json(
      { success: false, error: "Too many search requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": "30",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const result = await searchLegacyHandler({
    keyword: searchParams.get("q") ?? searchParams.get("keyword") ?? undefined,
    destinationSlug: searchParams.get("destinationSlug") ?? undefined,
    minDurationDays: numberOrUndefined(searchParams.get("minDurationDays")),
    maxDurationDays: numberOrUndefined(searchParams.get("maxDurationDays")),
    minPrice: numberOrUndefined(searchParams.get("minPrice")),
    maxPrice: numberOrUndefined(searchParams.get("maxPrice")),
    categoryId: searchParams.get("categoryId") ?? undefined,
    packageType: searchParams.get("packageType") ?? undefined,
    page: numberOrUndefined(searchParams.get("page")),
    pageSize: numberOrUndefined(searchParams.get("pageSize")),
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
