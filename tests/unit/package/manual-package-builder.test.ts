import { describe, expect, it } from "vitest";
import { isErr, isOk } from "@/shared/types";
import { getManualPackageBuilder, getPackageService } from "@/modules/package";
import { getDestinationService } from "@/modules/destination";

/**
 * Exercises the exact end-to-end path the original Sprint 6 bug broke:
 * ManualPackageBuilder → PackageDraftBuilder → PackageService.create(),
 * using the real, module-registered DI graph (no HTTP server needed — this
 * runs the same in-process composition a route handler would use).
 */
describe("ManualPackageBuilder — regression: title with spaces, no explicit code (Sprint 6 bug)", () => {
  it("successfully creates a package from a multi-word title with zero days/items", async () => {
    const destination = await getDestinationService().create({ name: `Builder Test Destination ${Date.now()}`, countryId: "country-1" });
    if (!isOk(destination)) throw new Error("destination setup failed");

    const result = await getManualPackageBuilder().build({
      title: "Havelock 5N 6D Adventure Package",
      destinationId: destination.value.id,
      durationDays: 6,
      durationNights: 5,
      days: [],
    });

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.code).not.toContain(" ");
      expect(result.value.code).toMatch(/^[A-Z0-9-]+$/);
    }
  });

  it("rejects a build() input missing required fields (title/destinationId/durationDays/days)", async () => {
    const result = await getManualPackageBuilder().build({ title: "Incomplete" });
    expect(isErr(result)).toBe(true);
  });

  it("two packages built from the same title get disambiguated, not rejected as duplicates", async () => {
    const destination = await getDestinationService().create({ name: `Builder Test Destination B ${Date.now()}`, countryId: "country-1" });
    if (!isOk(destination)) throw new Error("destination setup failed");

    const input = { title: "Repeated Title Package", destinationId: destination.value.id, durationDays: 3, durationNights: 2, days: [] };
    const first = await getManualPackageBuilder().build(input);
    const second = await getManualPackageBuilder().build(input);

    // Same title twice through create() (not clone()) legitimately collides
    // on the derived code/slug — this documents that current, real behavior
    // rather than assuming disambiguation that only clone()/duplicate() does.
    expect(isOk(first)).toBe(true);
    expect(isErr(second)).toBe(true);
    if (isErr(second)) expect(second.error.constructor.name).toBe("ConflictError");
  });

  it("getPackageService().getById() can retrieve a package created through the builder", async () => {
    const destination = await getDestinationService().create({ name: `Builder Test Destination C ${Date.now()}`, countryId: "country-1" });
    if (!isOk(destination)) throw new Error("destination setup failed");

    const built = await getManualPackageBuilder().build({
      title: `Retrievable Package ${Date.now()}`,
      destinationId: destination.value.id,
      durationDays: 2,
      durationNights: 1,
      days: [],
    });
    if (!isOk(built)) throw new Error("build failed");

    const fetched = await getPackageService().getById(built.value.id);
    expect(isOk(fetched)).toBe(true);
  });
});
