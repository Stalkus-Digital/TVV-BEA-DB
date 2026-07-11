import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { loginHandler } from "@/modules/auth";
import { isErr } from "@/shared/types";
import { getRateLimiter, getClientIp } from "@/shared/lib/rate-limiter";

// CF-7 FIX: Brute-force protection on login
// 10 attempts per IP per 15 minutes. After that, returns 429 for the remaining window.
const loginLimiter = getRateLimiter("auth-login", { windowMs: 15 * 60_000, max: 10 });

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = getClientIp(request);
  const limit = loginLimiter.check(ip);

  if (!limit.allowed) {
    const retryAfterSec = Math.ceil(limit.retryAfterMs / 1000);
    return NextResponse.json(
      { success: false, error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const body = await request.json().catch(() => null);
  const meta = {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    deviceInfo: request.headers.get("user-agent"),
  };
  const result = await loginHandler(body, meta);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
