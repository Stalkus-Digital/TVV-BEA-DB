import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { PackageDay as PrismaPackageDayRow } from "@/generated/prisma/client";
import type { PackageDay } from "../types/package-day";
import type { PackageDayRepository } from "./package-day.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaPackageDayRow): PackageDay {
  return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}

export class PrismaPackageDayRepository implements PackageDayRepository {
  async findById(id: string): Promise<Result<PackageDay | null, AppError>> {
    const row = await prisma.packageDay.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByPackage(packageId: string): Promise<Result<PackageDay[], AppError>> {
    const rows = await prisma.packageDay.findMany({ where: { packageId }, orderBy: { dayNumber: "asc" } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<PackageDay>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.packageDay.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.packageDay.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<PackageDay, "id">): Promise<Result<PackageDay, AppError>> {
    const row = await prisma.packageDay.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<PackageDay, "id">>): Promise<Result<PackageDay, AppError>> {
    try {
      const row = await prisma.packageDay.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Package day "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.packageDay.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Package day "${id}" not found`));
    }
  }
}
