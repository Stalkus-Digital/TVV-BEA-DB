import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { SupplierRecord as PrismaSupplierRecordRow } from "@/generated/prisma/client";
import type { SupplierCapability, SupplierRecord } from "../types";
import type { SupplierRecordRepository } from "./supplier-record.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaSupplierRecordRow): SupplierRecord {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    capabilities: row.capabilities as SupplierCapability[],
    status: row.status as SupplierRecord["status"],
    registeredAt: row.registeredAt.toISOString(),
  };
}

export class PrismaSupplierRecordRepository implements SupplierRecordRepository {
  async findById(id: string): Promise<Result<SupplierRecord | null, AppError>> {
    const row = await prisma.supplierRecord.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByCode(code: string): Promise<Result<SupplierRecord | null, AppError>> {
    const row = await prisma.supplierRecord.findUnique({ where: { code } });
    return ok(row ? toDomain(row) : null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<SupplierRecord>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.supplierRecord.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.supplierRecord.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  /**
   * Upsert on `code`, not a plain insert — a persistence-layer adaptation,
   * not a business-logic change. module.ts re-registers all three
   * placeholder adapters on every process start (SupplierRegistry, the
   * in-memory live-adapter map, is correctly never persisted and always
   * starts empty); with the in-memory repository this was invisible
   * because state never survived a restart to expose it. With `code`
   * marked @unique in the schema, a second server start would otherwise
   * violate that constraint on the second `create()` call. Upserting by
   * code keeps `registerSupplier()`'s own logic and return shape
   * completely unchanged — it still just calls `.create()`.
   */
  async create(data: Omit<SupplierRecord, "id">): Promise<Result<SupplierRecord, AppError>> {
    const row = await prisma.supplierRecord.upsert({
      where: { code: data.code },
      create: { code: data.code, name: data.name, capabilities: data.capabilities, status: data.status, registeredAt: data.registeredAt },
      update: { name: data.name, capabilities: data.capabilities, status: data.status, registeredAt: data.registeredAt },
    });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<SupplierRecord, "id">>): Promise<Result<SupplierRecord, AppError>> {
    try {
      const row = await prisma.supplierRecord.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Supplier record "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.supplierRecord.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Supplier record "${id}" not found`));
    }
  }
}
