import { describe, expect, it, vi } from "vitest";
import { InMemoryRuntimeCache } from "@/modules/supplier/runtime/cache/in-memory-runtime-cache";

describe("InMemoryRuntimeCache", () => {
  it("returns null for a key that was never set", async () => {
    const cache = new InMemoryRuntimeCache();
    expect(await cache.get("missing")).toBeNull();
  });

  it("returns a previously-set value before it expires", async () => {
    const cache = new InMemoryRuntimeCache();
    await cache.set("key", { a: 1 }, 1_000);
    expect(await cache.get("key")).toEqual({ a: 1 });
    expect(await cache.has("key")).toBe(true);
  });

  it("expires a value once its TTL has elapsed", async () => {
    vi.useFakeTimers();
    const cache = new InMemoryRuntimeCache();
    await cache.set("key", "value", 100);
    vi.advanceTimersByTime(101);
    expect(await cache.get("key")).toBeNull();
    expect(await cache.has("key")).toBe(false);
    vi.useRealTimers();
  });

  it("delete removes a key immediately", async () => {
    const cache = new InMemoryRuntimeCache();
    await cache.set("key", "value", 1_000);
    await cache.delete("key");
    expect(await cache.get("key")).toBeNull();
  });

  it("size reflects the number of live entries", async () => {
    const cache = new InMemoryRuntimeCache();
    await cache.set("a", 1, 1_000);
    await cache.set("b", 2, 1_000);
    expect(cache.size).toBe(2);
  });
});
