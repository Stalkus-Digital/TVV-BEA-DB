import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Prisma, Package as PrismaPackageRow } from "@/generated/prisma/client";
import type { Package } from "../types/package";
import type { PackageListFilter, PackageRepository } from "./package.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaPackageRow, avail?: { validFrom: string; validTo: string }): Package {
  const content = (row.content && typeof row.content === "object" ? row.content : {}) as Record<string, any>;
  const validFrom = content.validFrom || avail?.validFrom || null;
  const validTo = content.validTo || avail?.validTo || null;
  return {
    ...row,
    sourceType: row.sourceType as Package["sourceType"],
    tripType: (row.tripType as Package["tripType"]) ?? null,
    status: row.status as Package["status"],
    seo: row.seo as unknown as Package["seo"],
    faqs: row.faqs as unknown as Package["faqs"],
    content: row.content as any,
    validFrom,
    validTo,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toWhere(filter: PackageListFilter): Prisma.PackageWhereInput {
  const where: Prisma.PackageWhereInput = {};
  if (filter.destinationId) where.destinationId = filter.destinationId;
  
  if (filter.status) {
    where.status = filter.status;
  } else {
    where.status = { not: "ARCHIVED" };
  }

  if (filter.sourceType) where.sourceType = filter.sourceType;
  if (filter.tripType) where.tripType = filter.tripType;
  if (filter.isTemplate !== undefined) where.isTemplate = filter.isTemplate;
  return where;
}

export class PrismaPackageRepository implements PackageRepository {
  async findById(id: string): Promise<Result<Package | null, AppError>> {
    const [row, avail] = await Promise.all([
      prisma.package.findUnique({ where: { id } }),
      prisma.packageAvailability.findFirst({ where: { packageId: id }, orderBy: { validFrom: "asc" } }),
    ]);
    return ok(row ? toDomain(row, avail ? { validFrom: avail.validFrom.toISOString(), validTo: avail.validTo.toISOString() } : undefined) : null);
  }

  async findByCode(code: string): Promise<Result<Package | null, AppError>> {
    const row = await prisma.package.findUnique({ where: { code } });
    if (!row) return ok(null);
    const avail = await prisma.packageAvailability.findFirst({ where: { packageId: row.id }, orderBy: { validFrom: "asc" } });
    return ok(toDomain(row, avail ? { validFrom: avail.validFrom.toISOString(), validTo: avail.validTo.toISOString() } : undefined));
  }

  async findBySlug(slug: string): Promise<Result<Package | null, AppError>> {
    const row = await prisma.package.findUnique({ where: { slug } });
    if (!row) return ok(null);
    const avail = await prisma.packageAvailability.findFirst({ where: { packageId: row.id }, orderBy: { validFrom: "asc" } });
    return ok(toDomain(row, avail ? { validFrom: avail.validFrom.toISOString(), validTo: avail.validTo.toISOString() } : undefined));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Package>, AppError>> {
    return this.findByFilter(params);
  }

  async findByFilter(filter: PackageListFilter): Promise<Result<PaginatedResult<Package>, AppError>> {
    const page = filter.page ?? DEFAULT_PAGE;
    const pageSize = filter.pageSize ?? DEFAULT_PAGE_SIZE;
    const where = toWhere(filter);
    const [rows, total] = await Promise.all([
      prisma.package.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
      prisma.package.count({ where }),
    ]);

    const packageIds = rows.map((r) => r.id);
    const availabilities = packageIds.length > 0
      ? await prisma.packageAvailability.findMany({
          where: { packageId: { in: packageIds } },
          orderBy: { validFrom: "asc" },
        })
      : [];

    const availMap = new Map<string, { validFrom: string; validTo: string }>();
    for (const a of availabilities) {
      if (!availMap.has(a.packageId)) {
        availMap.set(a.packageId, {
          validFrom: a.validFrom.toISOString(),
          validTo: a.validTo.toISOString(),
        });
      }
    }

    return ok({
      items: rows.map((r) => toDomain(r, availMap.get(r.id))),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  }

  async create(data: Omit<Package, "id">): Promise<Result<Package, AppError>> {
    const row = await prisma.package.create({ data: { ...data, seo: data.seo as object, faqs: data.faqs as unknown as object, content: data.content ? (data.content as object) : undefined } });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<Package, "id">>): Promise<Result<Package, AppError>> {
    try {
      const row = await prisma.package.update({
        where: { id },
        data: { ...data, seo: data.seo !== undefined ? (data.seo as object) : undefined, faqs: data.faqs !== undefined ? (data.faqs as unknown as object) : undefined, content: data.content !== undefined ? (data.content as object) : undefined },
      });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Package "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.package.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Package "${id}" not found`));
    }
  }
}
