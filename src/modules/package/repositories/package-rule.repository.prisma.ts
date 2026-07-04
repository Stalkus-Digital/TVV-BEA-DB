import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Prisma, PackageRule as PrismaPackageRuleRow } from "@/generated/prisma/client";
import type { PackageRule } from "../types/package-rule";
import type { PackageRuleRepository } from "./package-rule.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaPackageRuleRow): PackageRule {
  return {
    ...row,
    cancellationTiers: row.cancellationTiers as unknown as PackageRule["cancellationTiers"],
    paymentTerms: row.paymentTerms as unknown as PackageRule["paymentTerms"],
    bookingWindow: row.bookingWindow as unknown as PackageRule["bookingWindow"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toJsonData(data: Partial<Omit<PackageRule, "id">>) {
  return {
    ...data,
    cancellationTiers: data.cancellationTiers !== undefined ? (data.cancellationTiers as unknown as object) : undefined,
    paymentTerms: data.paymentTerms !== undefined ? (data.paymentTerms as object) : undefined,
    bookingWindow: data.bookingWindow !== undefined ? (data.bookingWindow as object) : undefined,
  };
}

export class PrismaPackageRuleRepository implements PackageRuleRepository {
  async findById(id: string): Promise<Result<PackageRule | null, AppError>> {
    const row = await prisma.packageRule.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByPackage(packageId: string): Promise<Result<PackageRule | null, AppError>> {
    const row = await prisma.packageRule.findUnique({ where: { packageId } });
    return ok(row ? toDomain(row) : null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<PackageRule>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.packageRule.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.packageRule.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<PackageRule, "id">): Promise<Result<PackageRule, AppError>> {
    const row = await prisma.packageRule.create({ data: toJsonData(data) as Prisma.PackageRuleCreateInput });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<PackageRule, "id">>): Promise<Result<PackageRule, AppError>> {
    try {
      const row = await prisma.packageRule.update({ where: { id }, data: toJsonData(data) });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Package rule "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.packageRule.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Package rule "${id}" not found`));
    }
  }
}
