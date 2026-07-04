import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { PackageAvailability as PrismaPackageAvailabilityRow } from "@/generated/prisma/client";
import type { PackageAvailability } from "../types/package-availability";
import type { PackageAvailabilityRepository } from "./package-availability.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaPackageAvailabilityRow): PackageAvailability {
  return {
    ...row,
    validFrom: row.validFrom.toISOString(),
    validTo: row.validTo.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PrismaPackageAvailabilityRepository implements PackageAvailabilityRepository {
  async findById(id: string): Promise<Result<PackageAvailability | null, AppError>> {
    const row = await prisma.packageAvailability.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByPackage(packageId: string): Promise<Result<PackageAvailability[], AppError>> {
    const rows = await prisma.packageAvailability.findMany({ where: { packageId } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<PackageAvailability>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.packageAvailability.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.packageAvailability.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<PackageAvailability, "id">): Promise<Result<PackageAvailability, AppError>> {
    const row = await prisma.packageAvailability.create({
      data: { ...data, validFrom: new Date(data.validFrom), validTo: new Date(data.validTo) },
    });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<PackageAvailability, "id">>): Promise<Result<PackageAvailability, AppError>> {
    try {
      const row = await prisma.packageAvailability.update({
        where: { id },
        data: {
          ...data,
          validFrom: data.validFrom !== undefined ? new Date(data.validFrom) : undefined,
          validTo: data.validTo !== undefined ? new Date(data.validTo) : undefined,
        },
      });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Package availability "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.packageAvailability.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Package availability "${id}" not found`));
    }
  }
}
