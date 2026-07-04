import { beforeEach, describe, expect, it } from "vitest";
import { isErr, isOk } from "@/shared/types";
import { InMemoryDestinationRepository } from "@/modules/destination/repositories/destination.repository";
import { DestinationService } from "@/modules/destination/services/destination.service";
import { createTestLogger } from "../../helpers/test-logger";

function buildService() {
  return new DestinationService({ logger: createTestLogger() }, new InMemoryDestinationRepository());
}

const FAKE_COUNTRY_ID = "country-1"; // create() doesn't FK-check countryId against a real Country record

describe("DestinationService", () => {
  let service: DestinationService;

  beforeEach(() => {
    service = buildService();
  });

  it("create() derives a slug and defaults status to DRAFT", async () => {
    const result = await service.create({ name: "Andaman Islands", countryId: FAKE_COUNTRY_ID });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.slug).toBe("andaman-islands");
      expect(result.value.status).toBe("DRAFT");
      expect(result.value.gallery).toEqual([]);
    }
  });

  it("create() rejects a duplicate slug with ConflictError", async () => {
    await service.create({ name: "Havelock Island", countryId: FAKE_COUNTRY_ID });
    const duplicate = await service.create({ name: "Havelock Island", countryId: FAKE_COUNTRY_ID });
    expect(isErr(duplicate)).toBe(true);
    if (isErr(duplicate)) expect(duplicate.error.constructor.name).toBe("ConflictError");
  });

  describe("cycle detection (assertNoCycle, exercised through create())", () => {
    it("parentDestinationId is create-only — update() cannot introduce a cycle because it cannot change it at all", async () => {
      // validateUpdateDestination's UpdateDestinationInput type has no
      // parentDestinationId field (verified by reading destination.validation.ts) —
      // update() never calls assertNoCycle() because the hierarchy, once set at
      // create time, is immutable. A caller attempting to smuggle a new parent
      // through PATCH gets it silently ignored, not applied.
      const root = await service.create({ name: "Root", countryId: FAKE_COUNTRY_ID });
      if (!isOk(root)) throw new Error("setup failed");
      const child = await service.create({ name: "Child", countryId: FAKE_COUNTRY_ID, parentDestinationId: root.value.id });
      if (!isOk(child)) throw new Error("setup failed");

      const updated = await service.update(child.value.id, { parentDestinationId: null, title: "ignored-extra-field" });
      expect(isOk(updated)).toBe(true);
      if (isOk(updated)) expect(updated.value.parentDestinationId).toBe(root.value.id);
    });

    it("rejects a nonexistent parentDestinationId", async () => {
      const result = await service.create({ name: "Orphan", countryId: FAKE_COUNTRY_ID, parentDestinationId: "no-such-id" });
      expect(isErr(result)).toBe(true);
      if (isErr(result)) expect(result.error.constructor.name).toBe("NotFoundError");
    });

    it("accepts a valid multi-level chain (root → state → city) without a false-positive cycle", async () => {
      const root = await service.create({ name: "India Root", countryId: FAKE_COUNTRY_ID });
      if (!isOk(root)) throw new Error("setup failed");
      const mid = await service.create({ name: "Andaman Mid", countryId: FAKE_COUNTRY_ID, parentDestinationId: root.value.id });
      if (!isOk(mid)) throw new Error("setup failed");
      const leaf = await service.create({ name: "Havelock Leaf", countryId: FAKE_COUNTRY_ID, parentDestinationId: mid.value.id });
      expect(isOk(leaf)).toBe(true);
    });
  });

  describe("getBreadcrumbs()", () => {
    it("returns the chain root-first, ending with the destination itself", async () => {
      const root = await service.create({ name: "Andaman Islands", countryId: FAKE_COUNTRY_ID });
      if (!isOk(root)) throw new Error("setup failed");
      const leaf = await service.create({ name: "Havelock Island", countryId: FAKE_COUNTRY_ID, parentDestinationId: root.value.id });
      if (!isOk(leaf)) throw new Error("setup failed");

      const breadcrumbs = await service.getBreadcrumbs(leaf.value.id);
      expect(isOk(breadcrumbs)).toBe(true);
      if (isOk(breadcrumbs)) {
        expect(breadcrumbs.value.map((b) => b.name)).toEqual(["Andaman Islands", "Havelock Island"]);
      }
    });

    it("a root destination (no parent) returns a single-entry breadcrumb", async () => {
      const root = await service.create({ name: "Solo Root", countryId: FAKE_COUNTRY_ID });
      if (!isOk(root)) throw new Error("setup failed");
      const breadcrumbs = await service.getBreadcrumbs(root.value.id);
      expect(isOk(breadcrumbs)).toBe(true);
      if (isOk(breadcrumbs)) expect(breadcrumbs.value).toHaveLength(1);
    });
  });

  it("archive() sets status to ARCHIVED", async () => {
    const created = await service.create({ name: "To Archive", countryId: FAKE_COUNTRY_ID });
    if (!isOk(created)) throw new Error("setup failed");
    const archived = await service.archive(created.value.id);
    expect(isOk(archived)).toBe(true);
    if (isOk(archived)) expect(archived.value.status).toBe("ARCHIVED");
  });
});
