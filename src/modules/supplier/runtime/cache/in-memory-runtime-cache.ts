import type { RuntimeCache } from "./runtime-cache";

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

/** The only concrete `RuntimeCache` implementation this sprint — process-local, `Map`-backed, TTL enforced on read (lazy expiry, no background sweep). Nothing in this module calls it yet (no capability actually caches anything today); it exists so a future TripJack connector has somewhere to put e.g. an airport-list or static-rate lookup without inventing its own cache. */
export class InMemoryRuntimeCache implements RuntimeCache {
  private readonly store = new Map<string, CacheEntry>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null;
  }

  get size(): number {
    return this.store.size;
  }
}
