import { describe, expect, it } from "vitest";
import { isErr, isOk, ok } from "@/shared/types";
import { SupplierCapability } from "@/modules/supplier/types/supplier-capability";
import { resolveTimeoutMs, SupplierOperation } from "@/modules/supplier/runtime/timeouts/timeout-policy";
import { withTimeout } from "@/modules/supplier/runtime/timeouts/with-timeout";

describe("resolveTimeoutMs", () => {
  it("uses the Hotels timeout for a search against a HOTELS capability", () => {
    expect(resolveTimeoutMs(SupplierOperation.SEARCH, SupplierCapability.HOTELS)).toBe(8_000);
  });

  it("uses the Flights timeout for a search against a FLIGHTS capability", () => {
    expect(resolveTimeoutMs(SupplierOperation.SEARCH, SupplierCapability.FLIGHTS)).toBe(8_000);
  });

  it("uses the Booking timeout for a book() operation regardless of capability", () => {
    expect(resolveTimeoutMs(SupplierOperation.BOOK, SupplierCapability.HOTELS)).toBe(15_000);
    expect(resolveTimeoutMs(SupplierOperation.BOOK, SupplierCapability.ACTIVITIES)).toBe(15_000);
  });

  it("uses the Cancellation timeout for a cancel() operation regardless of capability", () => {
    expect(resolveTimeoutMs(SupplierOperation.CANCEL, SupplierCapability.FLIGHTS)).toBe(10_000);
    expect(resolveTimeoutMs(SupplierOperation.CANCEL, SupplierCapability.FERRIES)).toBe(10_000);
  });

  it("falls back to the default timeout for a capability with no dedicated entry", () => {
    expect(resolveTimeoutMs(SupplierOperation.SEARCH, SupplierCapability.VISA)).toBe(10_000);
    expect(resolveTimeoutMs(SupplierOperation.DETAILS, SupplierCapability.INSURANCE)).toBe(10_000);
  });
});

describe("withTimeout", () => {
  it("returns the operation's own result when it finishes before the timeout", async () => {
    const result = await withTimeout(async () => ok("fast"), 1_000);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value).toBe("fast");
  });

  it("returns a TimeoutError when the operation takes longer than the timeout", async () => {
    const result = await withTimeout(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return ok("too-slow");
    }, 20);
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error.name).toBe("TimeoutError");
  });

  it("passes an AbortSignal to the operation that fires when the timeout elapses", async () => {
    let observedAborted = false;
    // withTimeout() itself resolves as soon as the race is won by the timer (~10ms) — it does
    // not (and cannot) cancel the still-running operation promise, so we wait past the
    // operation's own 50ms before checking what it observed.
    const done = new Promise<void>((resolve) => {
      void withTimeout(async (signal) => {
        await new Promise((r) => setTimeout(r, 50));
        observedAborted = signal.aborted;
        resolve();
        return ok("done");
      }, 10);
    });
    await done;
    expect(observedAborted).toBe(true);
  });

  it("aborts the operation's signal when a parent signal is aborted", async () => {
    const parentController = new AbortController();
    let observedAborted = false;
    const done = new Promise<void>((resolve) => {
      void withTimeout(
        async (signal) => {
          await new Promise((r) => setTimeout(r, 50));
          observedAborted = signal.aborted;
          resolve();
          return ok("done");
        },
        1_000,
        parentController.signal
      );
    });
    parentController.abort();
    await done;
    expect(observedAborted).toBe(true);
  });
});
