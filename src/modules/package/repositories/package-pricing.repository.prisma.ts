import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Prisma, PackagePricing as PrismaPackagePricingRow } from "@/generated/prisma/client";
import type { PackagePricing } from "../types/package-pricing";
import type { PackagePricingRepository } from "./package-pricing.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaPackagePricingRow): PackagePricing {
  return {
    ...row,
    markup: row.markup as unknown as PackagePricing["markup"],
    discount: row.discount as unknown as PackagePricing["discount"],
    tax: row.tax as unknown as PackagePricing["tax"],
    occupancyPricing: row.occupancyPricing as unknown as PackagePricing["occupancyPricing"],
    childPricing: row.childPricing as unknown as PackagePricing["childPricing"],
    infantPricing: row.infantPricing as unknown as PackagePricing["infantPricing"],
    groupPricing: row.groupPricing as unknown as PackagePricing["groupPricing"],
    seasonalPricing: row.seasonalPricing as unknown as PackagePricing["seasonalPricing"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toJsonData(data: Partial<Omit<PackagePricing, "id">>) {
  return {
    ...data,
    markup: data.markup !== undefined ? (data.markup as object) : undefined,
    discount: data.discount !== undefined ? (data.discount as object) : undefined,
    tax: data.tax !== undefined ? (data.tax as object) : undefined,
    occupancyPricing: data.occupancyPricing !== undefined ? (data.occupancyPricing as unknown as object) : undefined,
    childPricing: data.childPricing !== undefined ? (data.childPricing as unknown as object) : undefined,
    infantPricing: data.infantPricing !== undefined ? (data.infantPricing as object) : undefined,
    groupPricing: data.groupPricing !== undefined ? (data.groupPricing as unknown as object) : undefined,
    seasonalPricing: data.seasonalPricing !== undefined ? (data.seasonalPricing as unknown as object) : undefined,
  };
}

export class PrismaPackagePricingRepository implements PackagePricingRepository {
  async findById(id: string): Promise<Result<PackagePricing | null, AppError>> {
    const row = await prisma.packagePricing.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByPackage(packageId: string): Promise<Result<PackagePricing | null, AppError>> {
    const row = await prisma.packagePricing.findUnique({ where: { packageId } });
    return ok(row ? toDomain(row) : null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<PackagePricing>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.packagePricing.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.packagePricing.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<PackagePricing, "id">): Promise<Result<PackagePricing, AppError>> {
    const row = await prisma.packagePricing.create({ data: toJsonData(data) as Prisma.PackagePricingCreateInput });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<PackagePricing, "id">>): Promise<Result<PackagePricing, AppError>> {
    try {
      const row = await prisma.packagePricing.update({ where: { id }, data: toJsonData(data) });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Package pricing "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.packagePricing.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Package pricing "${id}" not found`));
    }
  }
}
