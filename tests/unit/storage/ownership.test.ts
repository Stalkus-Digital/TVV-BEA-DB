import { describe, expect, it } from "vitest";
import { isErr, isOk } from "@/shared/types";
import { StorageCategory } from "@/modules/storage/types/storage-category";
import { generateStorageKey } from "@/modules/storage/uploads/key-generator";
import { validateOwnership } from "@/modules/storage/uploads/ownership";

describe("validateOwnership", () => {
  it("succeeds when the caller matches the key's embedded ownerId", () => {
    const key = generateStorageKey(StorageCategory.PROFILE_IMAGE, "user-1", "avatar.jpg");
    expect(isOk(validateOwnership(StorageCategory.PROFILE_IMAGE, key, "user-1"))).toBe(true);
  });

  it("fails with NotFoundError (not ForbiddenError) when the caller doesn't match", () => {
    const key = generateStorageKey(StorageCategory.PROFILE_IMAGE, "user-1", "avatar.jpg");
    const result = validateOwnership(StorageCategory.PROFILE_IMAGE, key, "user-2");
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error.name).toBe("NotFoundError");
  });

  it("fails for a malformed key", () => {
    expect(isErr(validateOwnership(StorageCategory.PROFILE_IMAGE, "garbage", "user-1"))).toBe(true);
  });
});
