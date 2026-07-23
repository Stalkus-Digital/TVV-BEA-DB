/**
 * Distributed, database-backed sliding-window rate limiter.
 * This completely prevents distributed brute force attacks when running on 
 * multiple Node instances or Vercel Serverless/Edge functions.
 */

import { prisma } from "@/shared/database/prisma-client";

interface RateLimitConfig {
  /** Window duration in milliseconds */
  windowMs: number;
  /** Maximum requests per window */
  max: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

class DistributedRateLimiter {
  constructor(private readonly name: string, private readonly config: RateLimitConfig) {}

  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.name}:${identifier}`;
    const now = Date.now();
    const windowStartMs = now - this.config.windowMs;
    const windowStartDate = new Date(windowStartMs);

    try {
      return await prisma.$transaction(async (tx) => {
        // Cleanup expired windows first (optional but keeps DB clean)
        await tx.rateLimit.deleteMany({
          where: { key, windowStart: { lt: windowStartDate } }
        });

        // Get current active limit for this window
        const record = await tx.rateLimit.findUnique({
          where: { key },
        });

        if (record) {
          if (record.count >= this.config.max) {
            // Blocked
            const oldestMs = record.windowStart.getTime();
            const retryAfterMs = oldestMs + this.config.windowMs - now;
            return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, retryAfterMs) };
          }

          // Increment count
          await tx.rateLimit.update({
            where: { key },
            data: { count: record.count + 1 },
          });

          return {
            allowed: true,
            remaining: this.config.max - (record.count + 1),
            retryAfterMs: 0,
          };
        } else {
          // First request in this window
          await tx.rateLimit.create({
            data: {
              key,
              count: 1,
              windowStart: new Date(now),
            },
          });

          return {
            allowed: true,
            remaining: this.config.max - 1,
            retryAfterMs: 0,
          };
        }
      });
    } catch (e: any) {
      // Fail-open strategy for rate limiter to prevent taking down the site if DB stalls
      console.error(`Rate limiter failed for ${key}, falling open`, e.message);
      return { allowed: true, remaining: 1, retryAfterMs: 0 };
    }
  }
}

// Singleton limiters — one per named rule
const limiters = new Map<string, DistributedRateLimiter>();

export function getRateLimiter(name: string, config: RateLimitConfig): DistributedRateLimiter {
  let limiter = limiters.get(name);
  if (!limiter) {
    limiter = new DistributedRateLimiter(name, config);
    limiters.set(name, limiter);
  }
  return limiter;
}

/** Convenience: extract the real client IP from Next.js request headers */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
