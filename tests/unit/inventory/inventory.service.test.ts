import { beforeEach, describe, expect, it } from "vitest";
import { isErr, isOk } from "@/shared/types";
import { InMemoryInventoryRepository } from "@/modules/inventory/repositories/inventory.repository";
import { InventoryService } from "@/modules/inventory/services/inventory.service";
import { createTestLogger } from "../../helpers/test-logger";

function buildService() {
  return new InventoryService({ logger: createTestLogger() }, new InMemoryInventoryRepository());
}

const hotelInput = { kind: "HOTEL", title: "Test Hotel", details: { starRating: 4, address: "1 Beach Road" } };

describe("InventoryService", () => {
  let service: InventoryService;

  beforeEach(() => {
    service = buildService();
  });

  it("create() persists a DRAFT-status item with timestamps", async () => {
    const result = await service.create(hotelInput);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.status).toBe("DRAFT");
      expect(result.value.id).toBeTruthy();
      expect(result.value.createdAt).toBe(result.value.updatedAt);
    }
  });

  it("create() propagates a validation failure without touching the repository", async () => {
    const result = await service.create({ kind: "HOTEL", title: "" });
    expect(isErr(result)).toBe(true);
    const list = await service.list();
    if (isOk(list)) expect(list.value.total).toBe(0);
  });

  it("getById() returns NotFoundError for a missing id", async () => {
    const result = await service.getById("does-not-exist");
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error.constructor.name).toBe("NotFoundError");
  });

  it("getById() returns the created item", async () => {
    const created = await service.create(hotelInput);
    if (!isOk(created)) throw new Error("setup failed");
    const fetched = await service.getById(created.value.id);
    expect(isOk(fetched)).toBe(true);
    if (isOk(fetched)) expect(fetched.value.id).toBe(created.value.id);
  });

  it("list(kind) filters to only that kind", async () => {
    await service.create(hotelInput);
    await service.create({ kind: "ACTIVITY", title: "City Tour", details: { durationMinutes: 120 } });

    const hotelsOnly = await service.list({ kind: "HOTEL" });
    expect(isOk(hotelsOnly)).toBe(true);
    if (isOk(hotelsOnly)) {
      expect(hotelsOnly.value.total).toBe(1);
      expect(hotelsOnly.value.items[0].kind).toBe("HOTEL");
    }
  });

  it("update() merges only the fields provided", async () => {
    const created = await service.create(hotelInput);
    if (!isOk(created)) throw new Error("setup failed");

    const updated = await service.update(created.value.id, { title: "Renamed Hotel" });
    expect(isOk(updated)).toBe(true);
    if (isOk(updated)) {
      expect(updated.value.title).toBe("Renamed Hotel");
      expect(updated.value.details).toEqual(hotelInput.details); // untouched
    }
  });

  it("update() on a missing id returns NotFoundError before validation ever runs", async () => {
    const result = await service.update("missing", { title: "x" });
    expect(isErr(result)).toBe(true);
    if (isErr(result)) expect(result.error.constructor.name).toBe("NotFoundError");
  });

  it("archive() sets status to ARCHIVED without changing other fields", async () => {
    const created = await service.create(hotelInput);
    if (!isOk(created)) throw new Error("setup failed");

    const archived = await service.archive(created.value.id);
    expect(isOk(archived)).toBe(true);
    if (isOk(archived)) {
      expect(archived.value.status).toBe("ARCHIVED");
      expect(archived.value.title).toBe(hotelInput.title);
    }
  });

  it("delete() actually removes the record — a subsequent getById fails", async () => {
    const created = await service.create(hotelInput);
    if (!isOk(created)) throw new Error("setup failed");

    const deleted = await service.delete(created.value.id);
    expect(isOk(deleted)).toBe(true);

    const fetched = await service.getById(created.value.id);
    expect(isErr(fetched)).toBe(true);
  });
});
