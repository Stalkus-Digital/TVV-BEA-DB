/**
 * Interface only, per this sprint's explicit instruction ("Create cache
 * interfaces only. No Redis implementation yet.") — no concrete class
 * implements this, and no service in this module depends on/injects one.
 * When a real cache (Redis or otherwise) is added later, it implements
 * this port and gets registered in module.ts; nothing above this
 * interface needs to change.
 */
export interface WebsiteCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
  invalidateByTag(tag: string): Promise<void>;
}
