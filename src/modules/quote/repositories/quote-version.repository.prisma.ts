import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { QuoteVersion as PrismaQuoteVersionRow } from "@/generated/prisma/client";
import type { QuoteVersion } from "../types/quote-version";
import type { QuoteVersionRepository } from "./quote-version.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaQuoteVersionRow): QuoteVersion {
  return { ...row, snapshot: row.snapshot as unknown, createdAt: row.createdAt.toISOString() };
}

export class PrismaQuoteVersionRepository implements QuoteVersionRepository {
  async findById(id: string): Promise<Result<QuoteVersion | null, AppError>> {
    const row = await prisma.quoteVersion.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByQuote(quoteId: string): Promise<Result<QuoteVersion[], AppError>> {
    const rows = await prisma.quoteVersion.findMany({ where: { quoteId }, orderBy: { versionNumber: "desc" } });
    return ok(rows.map(toDomain));
  }

  async findLatest(quoteId: string): Promise<Result<QuoteVersion | null, AppError>> {
    const row = await prisma.quoteVersion.findFirst({ where: { quoteId }, orderBy: { versionNumber: "desc" } });
    return ok(row ? toDomain(row) : null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<QuoteVersion>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.quoteVersion.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.quoteVersion.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<QuoteVersion, "id">): Promise<Result<QuoteVersion, AppError>> {
    const row = await prisma.quoteVersion.create({ data: { ...data, snapshot: data.snapshot as object } });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<QuoteVersion, "id">>): Promise<Result<QuoteVersion, AppError>> {
    try {
      const row = await prisma.quoteVersion.update({ where: { id }, data: { ...data, snapshot: data.snapshot !== undefined ? (data.snapshot as object) : undefined } });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Quote version "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.quoteVersion.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Quote version "${id}" not found`));
    }
  }
}
