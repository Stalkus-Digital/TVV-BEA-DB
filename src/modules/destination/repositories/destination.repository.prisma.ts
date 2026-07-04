import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Prisma, Destination as PrismaDestinationRow } from "@/generated/prisma/client";
import type { Destination } from "../types/destination";
import type { DestinationListFilter, DestinationRepository } from "./destination.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaDestinationRow): Destination {
  return {
    ...row,
    description: row.description,
    latitude: row.latitude,
    longitude: row.longitude,
    seo: row.seo as unknown as Destination["seo"],
    gallery: row.gallery as unknown as Destination["gallery"],
    faqs: row.faqs as unknown as Destination["faqs"],
    status: row.status as Destination["status"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toWhere(filter: DestinationListFilter): Prisma.DestinationWhereInput {
  const where: Prisma.DestinationWhereInput = {};
  if (filter.countryId) where.countryId = filter.countryId;
  if (filter.stateId) where.stateId = filter.stateId;
  if (filter.cityId) where.cityId = filter.cityId;
  if (filter.categoryId) where.categoryIds = { has: filter.categoryId };
  if (filter.parentDestinationId !== undefined) where.parentDestinationId = filter.parentDestinationId;
  if (filter.featured !== undefined) where.isFeatured = filter.featured;
  return where;
}

export class PrismaDestinationRepository implements DestinationRepository {
  async findById(id: string): Promise<Result<Destination | null, AppError>> {
    const row = await prisma.destination.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findBySlug(slug: string): Promise<Result<Destination | null, AppError>> {
    const row = await prisma.destination.findUnique({ where: { slug } });
    return ok(row ? toDomain(row) : null);
  }

  async findChildren(parentDestinationId: string): Promise<Result<Destination[], AppError>> {
    const rows = await prisma.destination.findMany({ where: { parentDestinationId } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Destination>, AppError>> {
    return this.findByFilter(params);
  }

  async findByFilter(filter: DestinationListFilter): Promise<Result<PaginatedResult<Destination>, AppError>> {
    const page = filter.page ?? DEFAULT_PAGE;
    const pageSize = filter.pageSize ?? DEFAULT_PAGE_SIZE;
    const where = toWhere(filter);
    const [rows, total] = await Promise.all([
      prisma.destination.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
      prisma.destination.count({ where }),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<Destination, "id">): Promise<Result<Destination, AppError>> {
    const row = await prisma.destination.create({
      data: {
        ...data,
        seo: data.seo as object,
        gallery: data.gallery as unknown as object,
        faqs: data.faqs as unknown as object,
      },
    });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<Destination, "id">>): Promise<Result<Destination, AppError>> {
    try {
      const row = await prisma.destination.update({
        where: { id },
        data: {
          ...data,
          seo: data.seo !== undefined ? (data.seo as object) : undefined,
          gallery: data.gallery !== undefined ? (data.gallery as unknown as object) : undefined,
          faqs: data.faqs !== undefined ? (data.faqs as unknown as object) : undefined,
          updatedAt: new Date().toISOString(),
        },
      });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Destination "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.destination.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Destination "${id}" not found`));
    }
  }
}
