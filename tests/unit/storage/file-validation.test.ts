import { describe, expect, it } from "vitest";
import { isErr, isOk } from "@/shared/types";
import { StorageCategory } from "@/modules/storage/types/storage-category";
import { isImageCategory, validateFile } from "@/modules/storage/uploads/file-validation";
import { validateImageUpload } from "@/modules/storage/images/image-validation";
import { validateDocumentUpload } from "@/modules/storage/documents/document-validation";

describe("isImageCategory", () => {
  it("classifies the four image categories as images", () => {
    expect(isImageCategory(StorageCategory.PROFILE_IMAGE)).toBe(true);
    expect(isImageCategory(StorageCategory.PACKAGE_IMAGE)).toBe(true);
    expect(isImageCategory(StorageCategory.DESTINATION_IMAGE)).toBe(true);
    expect(isImageCategory(StorageCategory.GALLERY_IMAGE)).toBe(true);
  });

  it("classifies every document category as non-image", () => {
    expect(isImageCategory(StorageCategory.INVOICE)).toBe(false);
    expect(isImageCategory(StorageCategory.PASSPORT)).toBe(false);
  });
});

describe("validateFile", () => {
  it("accepts an allowed image mime type within the size limit", () => {
    const result = validateFile({ category: StorageCategory.PROFILE_IMAGE, contentType: "image/jpeg", size: 1024 });
    expect(isOk(result)).toBe(true);
  });

  it("rejects a disallowed mime type for an image category", () => {
    const result = validateFile({ category: StorageCategory.PROFILE_IMAGE, contentType: "application/zip", size: 1024 });
    expect(isErr(result)).toBe(true);
  });

  it("rejects an image exceeding the configured max image size", () => {
    const result = validateFile({ category: StorageCategory.PROFILE_IMAGE, contentType: "image/jpeg", size: 999_999_999 });
    expect(isErr(result)).toBe(true);
  });

  it("rejects a zero-byte file", () => {
    const result = validateFile({ category: StorageCategory.INVOICE, contentType: "application/pdf", size: 0 });
    expect(isErr(result)).toBe(true);
  });

  it("accepts a PDF for a document category", () => {
    const result = validateFile({ category: StorageCategory.INVOICE, contentType: "application/pdf", size: 2048 });
    expect(isOk(result)).toBe(true);
  });
});

describe("validateImageUpload", () => {
  it("rejects a document category", () => {
    expect(isErr(validateImageUpload(StorageCategory.INVOICE, "image/jpeg", 1024))).toBe(true);
  });

  it("accepts a valid image category/mime combination", () => {
    expect(isOk(validateImageUpload(StorageCategory.GALLERY_IMAGE, "image/png", 1024))).toBe(true);
  });
});

describe("validateDocumentUpload", () => {
  it("rejects an image category", () => {
    expect(isErr(validateDocumentUpload(StorageCategory.PROFILE_IMAGE, "application/pdf", 1024))).toBe(true);
  });

  it("accepts a valid document category/mime combination", () => {
    expect(isOk(validateDocumentUpload(StorageCategory.PASSPORT, "application/pdf", 1024))).toBe(true);
  });
});
