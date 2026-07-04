import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { DestinationCategory } from "../types/destination-category";
import type { DestinationCategoryRepository } from "./destination-category.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: { id: string; name: string; slug: string; createdAt: Date; updatedAt: Date }): DestinationCategory {
  return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}

export class PrismaDestinationCategoryRepository implements DestinationCategoryRepository {
  async findById(id: string): Promise<Result<DestinationCategory | null, AppError>> {
    const row = await prisma.destinationCategory.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findBySlug(slug: string): Promise<Result<DestinationCategory | null, AppError>> {
    const row = await prisma.destinationCategory.findUnique({ where: { slug } });
    return ok(row ? toDomain(row) : null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<DestinationCategory>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.destinationCategory.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.destinationCategory.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<DestinationCategory, "id">): Promise<Result<DestinationCategory, AppError>> {
    const row = await prisma.destinationCategory.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<DestinationCategory, "id">>): Promise<Result<DestinationCategory, AppError>> {
    try {
      const row = await prisma.destinationCategory.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Destination category "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.destinationCategory.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Destination category "${id}" not found`));
    }
  }
}
