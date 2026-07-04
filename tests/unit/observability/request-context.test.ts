import { describe, expect, it } from "vitest";
import {
  attachRequestContextHeaders,
  buildRequestContext,
  generateRequestId,
  readRequestContextFromHeaders,
  resolveCorrelationId,
} from "@/modules/observability/tracing/request-context";

describe("generateRequestId", () => {
  it("produces a unique id on every call", () => {
    expect(generateRequestId()).not.toBe(generateRequestId());
  });
});

describe("resolveCorrelationId", () => {
  it("reuses an incoming correlation id", () => {
    expect(resolveCorrelationId("caller-supplied-id")).toBe("caller-supplied-id");
  });

  it("mints a fresh one when none was supplied", () => {
    expect(resolveCorrelationId(null)).toBeTruthy();
  });

  it("mints a fresh one for a blank string", () => {
    expect(resolveCorrelationId("   ")).not.toBe("   ");
  });
});

describe("buildRequestContext", () => {
  it("always mints a fresh requestId, even with an incoming correlation id", () => {
    const a = buildRequestContext("shared-correlation");
    const b = buildRequestContext("shared-correlation");
    expect(a.requestId).not.toBe(b.requestId);
    expect(a.correlationId).toBe("shared-correlation");
    expect(b.correlationId).toBe("shared-correlation");
  });
});

describe("attachRequestContextHeaders / readRequestContextFromHeaders", () => {
  it("round-trips a context through headers", () => {
    const context = buildRequestContext(null);
    const headers = new Headers();
    attachRequestContextHeaders(headers, context);
    expect(readRequestContextFromHeaders(headers)).toEqual(context);
  });

  it("returns null when headers are missing", () => {
    expect(readRequestContextFromHeaders(new Headers())).toBeNull();
  });

  it("returns null when only one of the two headers is present", () => {
    const headers = new Headers();
    headers.set("x-request-id", "abc");
    expect(readRequestContextFromHeaders(headers)).toBeNull();
  });
});
