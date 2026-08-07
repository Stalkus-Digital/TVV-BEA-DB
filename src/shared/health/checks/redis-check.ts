import type { HealthCheck, HealthCheckResult } from "../health.types";

/**
 * RedisHealthCheck — pings the Redis instance using ioredis and reports
 * its latency. If Redis is unavailable, the check is "degraded" (not
 * "unhealthy"), so the system still serves requests but the ops team is alerted.
 */
export class RedisHealthCheck implements HealthCheck {
  readonly name = "redis";

  async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      // Lazily import ioredis to avoid blocking startup if REDIS_URL is missing
      const { default: Redis } = await import("ioredis");
      const redisUrl = process.env.REDIS_URL;
      if (!redisUrl) {
        return {
          name: this.name,
          status: "degraded",
          details: { reason: "REDIS_URL not configured" },
          checkedAt: new Date().toISOString(),
        };
      }

      const redis = new Redis(redisUrl, {
        connectTimeout: 3000,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });
      await redis.connect();
      const pong = await redis.ping();
      await redis.quit();

      return {
        name: this.name,
        status: pong === "PONG" ? "healthy" : "degraded",
        details: { latencyMs: Date.now() - start, response: pong },
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: this.name,
        status: "degraded", // degraded, not unhealthy — Redis is optional for read path
        details: {
          error: error instanceof Error ? error.message : String(error),
          latencyMs: Date.now() - start,
        },
        checkedAt: new Date().toISOString(),
      };
    }
  }
}
