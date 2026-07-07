import { randomUUID } from "node:crypto";
import {
  DEFAULT_PAGINATION,
  err,
  ok,
  toPaginatedResult,
  type PaginatedResult,
  type PaginationParams,
  type Result,
} from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import { NotFoundError, type AppError } from "@/shared/errors";
import type { InventoryItem, InventoryKind } from "../types";

export interface InventoryRepository extends BaseRepository<InventoryItem, string> {
  findByKind(
    kind: InventoryKind,
    params?: PaginationParams
  ): Promise<Result<PaginatedResult<InventoryItem>, AppError>>;
}

/**
 * In-memory implementation — no database exists yet (Prisma + PostgreSQL are
 * decided but not installed, per CLAUDE.md). Swapping this for a
 * Prisma-backed repository later means implementing InventoryRepository
 * again; nothing that depends on the interface (the service, the API
 * handlers) needs to change.
 */
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export class PrismaInventoryRepository extends PrismaStore<any> implements InventoryRepository {
  constructor() {
    super(prisma.inventoryItem);
  }

  async findByKind(
    kind: InventoryKind,
    params: PaginationParams = {}
  ): Promise<Result<PaginatedResult<InventoryItem>, AppError>> {
    const items = (await this.delegate.findMany()).filter(( item: any ) => item.kind === kind);
    return ok(this.paginate(items, params));
  }

  private paginate(items: InventoryItem[], params: PaginationParams): PaginatedResult<InventoryItem> {
    const page = params.page ?? DEFAULT_PAGINATION.page;
    const pageSize = params.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return toPaginatedResult(paged, items.length, { page, pageSize });
  }
}
