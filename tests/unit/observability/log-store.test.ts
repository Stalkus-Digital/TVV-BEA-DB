import { describe, expect, it } from "vitest";
import { LogStore } from "@/modules/observability/logging/log-store";

function entry(overrides: Partial<{ level: "debug" | "info" | "warn" | "error"; scope: string; message: string }> = {}) {
  return { timestamp: new Date().toISOString(), level: overrides.level ?? "info", scope: overrides.scope ?? "test.scope", message: overrides.message ?? "hello" };
}

describe("LogStore", () => {
  it("records and lists entries, most-recent first", () => {
    const store = new LogStore(10);
    store.record(entry({ message: "first" }));
    store.record(entry({ message: "second" }));
    const listed = store.list();
    expect(listed[0].message).toBe("second");
    expect(listed[1].message).toBe("first");
  });

  it("drops the oldest entry once capacity is exceeded", () => {
    const store = new LogStore(2);
    store.record(entry({ message: "a" }));
    store.record(entry({ message: "b" }));
    store.record(entry({ message: "c" }));
    expect(store.size).toBe(2);
    expect(store.list().map((e) => e.message)).toEqual(["c", "b"]);
  });

  it("filters by level", () => {
    const store = new LogStore(10);
    store.record(entry({ level: "info", message: "i" }));
    store.record(entry({ level: "error", message: "e" }));
    const errors = store.list({ level: "error" });
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe("e");
  });

  it("filters by scope prefix", () => {
    const store = new LogStore(10);
    store.record(entry({ scope: "booking.service", message: "b" }));
    store.record(entry({ scope: "quote.service", message: "q" }));
    const bookingOnly = store.list({ scope: "booking" });
    expect(bookingOnly).toHaveLength(1);
    expect(bookingOnly[0].message).toBe("b");
  });

  it("respects a custom limit", () => {
    const store = new LogStore(10);
    for (let i = 0; i < 5; i++) store.record(entry({ message: `m${i}` }));
    expect(store.list({ limit: 2 })).toHaveLength(2);
  });

  it("mostRecentForScope finds the latest matching entry", () => {
    const store = new LogStore(10);
    store.record(entry({ scope: "booking.service", message: "old" }));
    store.record(entry({ scope: "quote.service", message: "unrelated" }));
    store.record(entry({ scope: "booking.repository", message: "new" }));
    expect(store.mostRecentForScope("booking")?.message).toBe("new");
  });

  it("mostRecentForScope returns null when nothing matches", () => {
    const store = new LogStore(10);
    store.record(entry({ scope: "quote.service" }));
    expect(store.mostRecentForScope("booking")).toBeNull();
  });
});
