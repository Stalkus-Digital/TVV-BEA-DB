import { describe, expect, it } from "vitest";
import { isErr, isOk } from "@/shared/types";
import { slugify, validateCreatePackage, validatePackageCode } from "@/modules/package/validation/package.validation";

describe("validatePackageCode", () => {
  it("accepts a valid uppercase code", () => {
    const result = validatePackageCode("PKG-ANDAMAN-5N6D-001");
    expect(isOk(result)).toBe(true);
  });

  it("uppercases a lowercase code", () => {
    const result = validatePackageCode("pkg-test");
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value).toBe("PKG-TEST");
  });

  it("rejects a code containing spaces", () => {
    expect(isErr(validatePackageCode("Havelock 5N 6D"))).toBe(true);
  });

  it("rejects an empty code", () => {
    expect(isErr(validatePackageCode(""))).toBe(true);
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates a title with spaces", () => {
    expect(slugify("Havelock 5N 6D Package")).toBe("havelock-5n-6d-package");
  });

  it("strips non-alphanumeric characters", () => {
    expect(slugify("Andaman & Nicobar!")).toBe("andaman-nicobar");
  });

  it("trims leading/trailing hyphens produced by leading/trailing punctuation", () => {
    expect(slugify("  -Test-  ")).toBe("test");
  });
});

describe("validateCreatePackage — regression: code derivation from a title with spaces (Sprint 6 bug)", () => {
  it("derives a valid uppercase-hyphenated code from a multi-word title when no code is supplied", () => {
    // Original bug: PackageDraftBuilder defaulted `code: draft.code ?? draft.title`,
    // passing the raw "Havelock 5N 6D Package" title straight through as the
    // code, which PACKAGE_CODE_PATTERN rejected (spaces aren't allowed) —
    // this test locks in that a title-only input now derives a valid code here.
    const result = validateCreatePackage({
      title: "Havelock 5N 6D Package",
      destinationId: "dest-1",
      durationDays: 6,
      durationNights: 5,
    });

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.code).toBe("HAVELOCK-5N-6D-PACKAGE");
      expect(result.value.code).not.toContain(" ");
      expect(result.value.slug).toBe("havelock-5n-6d-package");
    }
  });

  it("still honors an explicitly supplied code instead of deriving one", () => {
    const result = validateCreatePackage({
      title: "Havelock 5N 6D Package",
      code: "CUSTOM-CODE-01",
      destinationId: "dest-1",
      durationDays: 6,
      durationNights: 5,
    });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.code).toBe("CUSTOM-CODE-01");
  });

  it("rejects a non-positive durationDays", () => {
    const result = validateCreatePackage({ title: "x", destinationId: "d", durationDays: 0, durationNights: 0 });
    expect(isErr(result)).toBe(true);
  });

  it("rejects a missing destinationId", () => {
    const result = validateCreatePackage({ title: "x", durationDays: 1, durationNights: 0 });
    expect(isErr(result)).toBe(true);
  });

  it("defaults sourceType to MANUAL when omitted", () => {
    const result = validateCreatePackage({ title: "x", destinationId: "d", durationDays: 1, durationNights: 0 });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) expect(result.value.sourceType).toBe("MANUAL");
  });

  it("rejects an invalid sourceType", () => {
    const result = validateCreatePackage({ title: "x", destinationId: "d", durationDays: 1, durationNights: 0, sourceType: "NOT_REAL" });
    expect(isErr(result)).toBe(true);
  });
});
