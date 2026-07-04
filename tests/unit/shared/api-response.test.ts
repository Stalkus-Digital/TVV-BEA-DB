import { describe, expect, it } from "vitest";
import { apiError, apiSuccess, statusForError } from "@/api/response";
import { NotFoundError, ValidationError } from "@/shared/errors";

describe("apiSuccess", () => {
  it("wraps data in the {success, data} envelope", () => {
    expect(apiSuccess({ id: 1 })).toEqual({ success: true, data: { id: 1 } });
  });

  it("includes meta only when provided", () => {
    expect(apiSuccess({ id: 1 }, { page: 1 })).toEqual({ success: true, data: { id: 1 }, meta: { page: 1 } });
    expect(apiSuccess({ id: 1 })).not.toHaveProperty("meta");
  });
});

describe("apiError", () => {
  it("surfaces an AppError's real code, message, and details", () => {
    const error = new ValidationError("title is required", { field: "title" });
    expect(apiError(error)).toEqual({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "title is required", details: { field: "title" } },
    });
  });

  it("never leaks a non-AppError's raw message — this is a security boundary, not incidental behavior", () => {
    const secret = new Error("password=hunter2 connection string leaked here");
    const result = apiError(secret);
    expect(result.error.code).toBe("INTERNAL_ERROR");
    expect(result.error.message).toBe("Unexpected error");
    expect(JSON.stringify(result)).not.toContain("hunter2");
  });

  it("handles a thrown non-Error value (string, undefined) the same generic way", () => {
    expect(apiError("just a string").error.message).toBe("Unexpected error");
    expect(apiError(undefined).error.message).toBe("Unexpected error");
  });
});

describe("statusForError", () => {
  it("returns the AppError's own statusCode", () => {
    expect(statusForError(new NotFoundError("x"))).toBe(404);
  });

  it("defaults to 500 for anything that isn't an AppError", () => {
    expect(statusForError(new Error("plain"))).toBe(500);
    expect(statusForError("string")).toBe(500);
  });
});
