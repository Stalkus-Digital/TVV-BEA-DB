import { describe, expect, it } from "vitest";
import { err, isErr, isOk, mapErrResult, mapResult, ok, unwrap, unwrapOr } from "@/shared/types/result";

describe("Result<T, E>", () => {
  it("ok() produces a success result isOk() recognizes", () => {
    const result = ok(42);
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
    if (isOk(result)) expect(result.value).toBe(42);
  });

  it("err() produces a failure result isErr() recognizes", () => {
    const result = err("boom");
    expect(isErr(result)).toBe(true);
    expect(isOk(result)).toBe(false);
    if (isErr(result)) expect(result.error).toBe("boom");
  });

  it("mapResult transforms the value on ok, passes through untouched on err", () => {
    expect(mapResult(ok(2), (n) => n * 10)).toEqual(ok(20));
    const failure = err<string, number>("nope");
    expect(mapResult(failure, (n) => n * 10)).toEqual(err("nope"));
  });

  it("mapErrResult transforms the error on err, passes through untouched on ok", () => {
    expect(mapErrResult(err("raw"), (e) => `wrapped:${e}`)).toEqual(err("wrapped:raw"));
    const success = ok<number, string>(5);
    expect(mapErrResult(success, (e) => `wrapped:${e}`)).toEqual(ok(5));
  });

  it("unwrap returns the value on ok", () => {
    expect(unwrap(ok("value"))).toBe("value");
  });

  it("unwrap throws the error on err (Error instances rethrown as-is)", () => {
    const original = new Error("original");
    expect(() => unwrap(err(original))).toThrow(original);
  });

  it("unwrap wraps a non-Error err value in a new Error", () => {
    expect(() => unwrap(err("string error"))).toThrow("string error");
  });

  it("unwrapOr returns the value on ok, the fallback on err", () => {
    expect(unwrapOr(ok(1), 99)).toBe(1);
    expect(unwrapOr(err("x"), 99)).toBe(99);
  });
});
