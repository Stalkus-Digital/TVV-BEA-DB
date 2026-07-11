/**
 * In-memory sliding-window rate limiter.
 * No external dependency required — works on any Node.js deployment.
 *
 * Usage:
 *   const limiter = getRateLimiter("auth-login", { windowMs: 60_000, max: 10 });
 *   const result = limiter.check(ip);
 *   if (!result.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 *
 * For multi-instance deployments, swap this for a Redis-backed counter.
 * The interface is identical — only the backing store changes.
 */

interface RateLimitRecord {
  timestamps: number[];
}

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

class InMemoryRateLimiter {
  private readonly store = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private readonly config: RateLimitConfig) {
    // Periodic cleanup to prevent memory leaks from stale keys
    this.cleanupInterval = setInterval(() => {
      const cutoff = Date.now() - this.config.windowMs;
      for (const [key, record] of this.store.entries()) {
        const fresh = record.timestamps.filter(t => t > cutoff);
        if (fresh.length === 0) {
          this.store.delete(key);
        } else {
          record.timestamps = fresh;
        }
      }
    }, this.config.windowMs);

    // Don't block process exit
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  check(key: string): RateLimitResult {
    const now = Date.now();
    const cutoff = now - this.config.windowMs;

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    // Slide window — remove expired timestamps
    record.timestamps = record.timestamps.filter(t => t > cutoff);

    if (record.timestamps.length >= this.config.max) {
      const oldest = record.timestamps[0];
      const retryAfterMs = oldest + this.config.windowMs - now;
      return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, retryAfterMs) };
    }

    record.timestamps.push(now);
    return {
      allowed: true,
      remaining: this.config.max - record.timestamps.length,
      retryAfterMs: 0,
    };
  }
}

// Singleton limiters — one per named rule
const limiters = new Map<string, InMemoryRateLimiter>();

export function getRateLimiter(name: string, config: RateLimitConfig): InMemoryRateLimiter {
  let limiter = limiters.get(name);
  if (!limiter) {
    limiter = new InMemoryRateLimiter(config);
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
