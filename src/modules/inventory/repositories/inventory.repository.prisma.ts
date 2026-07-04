import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { InventoryItem as PrismaInventoryItemRow } from "@/generated/prisma/client";
import type { InventoryItem, InventoryKind } from "../types";
import type { InventoryRepository } from "./inventory.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

/** Prisma's DateTime columns come back as `Date`; every other field in this row shape is already identical to InventoryItem's. */
function toDomain(row: PrismaInventoryItemRow): InventoryItem {
  return {
    id: row.id,
    kind: row.kind as InventoryKind,
    destinationId: row.destinationId,
    title: row.title,
    status: row.status as InventoryItem["status"],
    details: row.details as unknown as InventoryItem["details"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  } as InventoryItem;
}

function paginationArgs(params: PaginationParams = {}) {
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}

/**
 * Same InventoryRepository interface the in-memory version implemented —
 * nothing above this (InventoryService, the API handlers) changed at all.
 * Sprint 12's expand→migrate→cutover→contract: this is "migrate" (the
 * class exists); module.ts's registration swap is "cutover"; deleting
 * InMemoryInventoryRepository once verified is "contract" — see
 * docs/23_DATABASE_MIGRATION.md.
 */
export class PrismaInventoryRepository implements InventoryRepository {
  async findById(id: string): Promise<Result<InventoryItem | null, AppError>> {
    const row = await prisma.inventoryItem.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<InventoryItem>, AppError>> {
    const { skip, take, page, pageSize } = paginationArgs(params);
    const [rows, total] = await Promise.all([
      prisma.inventoryItem.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
      prisma.inventoryItem.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async findByKind(kind: InventoryKind, params: PaginationParams = {}): Promise<Result<PaginatedResult<InventoryItem>, AppError>> {
    const { skip, take, page, pageSize } = paginationArgs(params);
    const [rows, total] = await Promise.all([
      prisma.inventoryItem.findMany({ where: { kind }, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.inventoryItem.count({ where: { kind } }),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<InventoryItem, "id">): Promise<Result<InventoryItem, AppError>> {
    const row = await prisma.inventoryItem.create({
      data: {
        kind: data.kind,
        destinationId: data.destinationId,
        title: data.title,
        status: data.status,
        details: data.details as object,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<InventoryItem, "id">>): Promise<Result<InventoryItem, AppError>> {
    try {
      const row = await prisma.inventoryItem.update({
        where: { id },
        data: { ...data, details: data.details !== undefined ? (data.details as object) : undefined },
      });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Inventory item "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.inventoryItem.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Inventory item "${id}" not found`));
    }
  }
}
