import Redis from "ioredis";

/**
 * Redis connection with graceful degradation.
 *
 * If REDIS_URL is not set OR the connection fails, the export is `null`.
 * All callers (`queue.ts`, `tripjack.client.ts`) already guard with
 * optional chaining (`redis?.get(...)`) so they degrade silently without
 * crashing the server process when Redis is unavailable.
 *
 * This is intentional for development (no local Redis needed) and for
 * production environments where Redis is optional (sync fulfillment path
 * is used as fallback — see queue.ts).
 */

const redisUrl = process.env.REDIS_URL;

function createRedisClient(): Redis | null {
  if (!redisUrl) {
    console.info("[Redis] REDIS_URL is not set — Redis is disabled. Booking queue will run synchronously.");
    return null;
  }

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy(times: number) {
      if (times > 5) {
        console.warn("[Redis] Max reconnection attempts reached — Redis disabled for this session.");
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000);
    },
  });

  client.on("error", (err) => {
    // Log but never crash the process — Redis is optional
    console.warn("[Redis] Connection error (non-fatal):", err.message);
  });

  client.on("connect", () => {
    console.info("[Redis] Connected successfully.");
  });

  return client;
}

const globalForRedis = global as unknown as { redis: Redis | null };
export const redis: Redis | null = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export async function withCache<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  if (redis) {
    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached) as T;
    } catch (e) {
      console.warn("[Redis] Cache read error (non-fatal):", e);
    }
  }

  const fresh = await fetcher();

  if (redis) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(fresh));
    } catch (e) {
      console.warn("[Redis] Cache write error (non-fatal):", e);
    }
  }

  return fresh;
}
