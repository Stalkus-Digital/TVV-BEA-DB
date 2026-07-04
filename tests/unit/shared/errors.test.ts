import { describe, expect, it } from "vitest";
import {
  AppError,
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  NotImplementedError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/errors";

describe("AppError subclasses", () => {
  it.each([
    [ValidationError, "bad input", 400, "VALIDATION_ERROR"],
    [NotFoundError, "missing", 404, "NOT_FOUND"],
    [UnauthorizedError, undefined, 401, "UNAUTHORIZED"],
    [ForbiddenError, undefined, 403, "FORBIDDEN"],
    [ConflictError, "dup", 409, "CONFLICT"],
    [NotImplementedError, undefined, 501, "NOT_IMPLEMENTED"],
  ] as const)("%s carries the correct statusCode and code", (ErrorClass, message, statusCode, code) => {
    const instance = message === undefined ? new ErrorClass() : new ErrorClass(message);
    expect(instance).toBeInstanceOf(AppError);
    expect(instance.statusCode).toBe(statusCode);
    expect(instance.code).toBe(code);
    expect(instance.isOperational).toBe(true);
  });

  it("InternalError defaults isOperational to false (a programmer error, not an expected failure)", () => {
    const error = new InternalError();
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(false);
  });

  it("carries optional details through unchanged", () => {
    const details = { field: "email" };
    const error = new ValidationError("invalid", details);
    expect(error.details).toBe(details);
  });

  it("is a real Error — instanceof Error holds, message is set, stack exists", () => {
    const error = new NotFoundError("Package \"x\" not found");
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Package "x" not found');
    expect(error.stack).toBeTruthy();
  });
});
