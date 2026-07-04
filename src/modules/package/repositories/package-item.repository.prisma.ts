import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { PackageItem as PrismaPackageItemRow } from "@/generated/prisma/client";
import type { PackageItem } from "../types/package-item";
import type { PackageItemRepository } from "./package-item.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaPackageItemRow): PackageItem {
  return {
    ...row,
    kind: row.kind as PackageItem["kind"],
    resolutionMode: row.resolutionMode as PackageItem["resolutionMode"],
    pricingMode: row.pricingMode as PackageItem["pricingMode"],
    slotCriteria: row.slotCriteria as PackageItem["slotCriteria"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PrismaPackageItemRepository implements PackageItemRepository {
  async findById(id: string): Promise<Result<PackageItem | null, AppError>> {
    const row = await prisma.packageItem.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByDay(packageDayId: string): Promise<Result<PackageItem[], AppError>> {
    const rows = await prisma.packageItem.findMany({ where: { packageDayId }, orderBy: { position: "asc" } });
    return ok(rows.map(toDomain));
  }

  async findByDays(packageDayIds: string[]): Promise<Result<PackageItem[], AppError>> {
    const rows = await prisma.packageItem.findMany({ where: { packageDayId: { in: packageDayIds } } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<PackageItem>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.packageItem.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.packageItem.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<PackageItem, "id">): Promise<Result<PackageItem, AppError>> {
    const row = await prisma.packageItem.create({
      data: { ...data, slotCriteria: data.slotCriteria !== null ? (data.slotCriteria as object) : undefined },
    });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<PackageItem, "id">>): Promise<Result<PackageItem, AppError>> {
    try {
      const row = await prisma.packageItem.update({
        where: { id },
        data: { ...data, slotCriteria: data.slotCriteria !== undefined ? (data.slotCriteria as object) : undefined },
      });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Package item "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.packageItem.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Package item "${id}" not found`));
    }
  }
}
