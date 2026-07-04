import { describe, expect, it } from "vitest";
import { DEFAULT_PAGINATION, toPaginatedResult } from "@/shared/types/pagination";

describe("toPaginatedResult", () => {
  it("uses the default page/pageSize when none is given", () => {
    const result = toPaginatedResult(["a", "b"], 2);
    expect(result.page).toBe(DEFAULT_PAGINATION.page);
    expect(result.pageSize).toBe(DEFAULT_PAGINATION.pageSize);
  });

  it("computes totalPages by ceiling division", () => {
    const result = toPaginatedResult([], 45, { page: 1, pageSize: 20 });
    expect(result.totalPages).toBe(3);
  });

  it("never reports fewer than 1 totalPages, even for zero total items", () => {
    const result = toPaginatedResult([], 0, { page: 1, pageSize: 20 });
    expect(result.totalPages).toBe(1);
  });

  it("passes items and total through unchanged", () => {
    const items = [1, 2, 3];
    const result = toPaginatedResult(items, 3, { page: 1, pageSize: 20 });
    expect(result.items).toBe(items);
    expect(result.total).toBe(3);
  });
});
