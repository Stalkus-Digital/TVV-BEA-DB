/**
 * The abstraction this sprint calls for — "prepare abstraction only, do not
 * integrate Redis, use in-memory cache." Same "define the interface, swap
 * the implementation" discipline as Storage's `StorageProvider`: a future
 * Redis-backed implementation is a second class satisfying this exact
 * interface, swapped in at `module.ts`'s registration point — nothing
 * above this layer (dispatcher/executor) would change.
 */
export interface RuntimeCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}
