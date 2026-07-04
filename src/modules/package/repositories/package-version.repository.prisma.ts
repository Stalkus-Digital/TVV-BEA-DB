import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { PackageVersion as PrismaPackageVersionRow } from "@/generated/prisma/client";
import type { PackageVersion } from "../types/package-version";
import type { PackageVersionRepository } from "./package-version.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaPackageVersionRow): PackageVersion {
  return { ...row, snapshot: row.snapshot as unknown, publishedAt: row.publishedAt.toISOString() };
}

export class PrismaPackageVersionRepository implements PackageVersionRepository {
  async findById(id: string): Promise<Result<PackageVersion | null, AppError>> {
    const row = await prisma.packageVersion.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByPackage(packageId: string): Promise<Result<PackageVersion[], AppError>> {
    const rows = await prisma.packageVersion.findMany({ where: { packageId }, orderBy: { versionNumber: "desc" } });
    return ok(rows.map(toDomain));
  }

  async findLatest(packageId: string): Promise<Result<PackageVersion | null, AppError>> {
    const row = await prisma.packageVersion.findFirst({ where: { packageId }, orderBy: { versionNumber: "desc" } });
    return ok(row ? toDomain(row) : null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<PackageVersion>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.packageVersion.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.packageVersion.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<PackageVersion, "id">): Promise<Result<PackageVersion, AppError>> {
    const row = await prisma.packageVersion.create({ data: { ...data, snapshot: data.snapshot as object } });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<PackageVersion, "id">>): Promise<Result<PackageVersion, AppError>> {
    try {
      const row = await prisma.packageVersion.update({ where: { id }, data: { ...data, snapshot: data.snapshot !== undefined ? (data.snapshot as object) : undefined } });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Package version "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.packageVersion.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Package version "${id}" not found`));
    }
  }
}
