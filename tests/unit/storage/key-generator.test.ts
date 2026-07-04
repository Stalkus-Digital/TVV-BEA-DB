import { describe, expect, it } from "vitest";
import { StorageCategory } from "@/modules/storage/types/storage-category";
import { extractOwnerIdFromKey, generateStorageKey } from "@/modules/storage/uploads/key-generator";

describe("generateStorageKey", () => {
  it("builds a key under the category's prefix, embedding the ownerId", () => {
    const key = generateStorageKey(StorageCategory.PROFILE_IMAGE, "user-123", "avatar.jpg");
    expect(key.startsWith("profiles/user-123/")).toBe(true);
    expect(key.endsWith(".jpg")).toBe(true);
  });

  it("derives the extension from the file name, defaulting to bin when absent", () => {
    const withExt = generateStorageKey(StorageCategory.INVOICE, "booking-1", "invoice.pdf");
    expect(withExt.endsWith(".pdf")).toBe(true);

    const withoutExt = generateStorageKey(StorageCategory.INVOICE, "booking-1", "invoice");
    expect(withoutExt.endsWith(".bin")).toBe(true);
  });

  it("generates a unique key on every call for the same input", () => {
    const first = generateStorageKey(StorageCategory.PACKAGE_IMAGE, "pkg-1", "cover.png");
    const second = generateStorageKey(StorageCategory.PACKAGE_IMAGE, "pkg-1", "cover.png");
    expect(first).not.toBe(second);
  });
});

describe("extractOwnerIdFromKey", () => {
  it("round-trips the ownerId embedded by generateStorageKey", () => {
    const key = generateStorageKey(StorageCategory.PASSPORT, "customer-42", "passport-scan.pdf");
    expect(extractOwnerIdFromKey(StorageCategory.PASSPORT, key)).toBe("customer-42");
  });

  it("returns null when the key doesn't belong to the given category's prefix", () => {
    const key = generateStorageKey(StorageCategory.VISA, "customer-42", "visa.pdf");
    expect(extractOwnerIdFromKey(StorageCategory.PASSPORT, key)).toBeNull();
  });

  it("returns null for a malformed key", () => {
    expect(extractOwnerIdFromKey(StorageCategory.PROFILE_IMAGE, "not-a-real-key")).toBeNull();
  });
});
