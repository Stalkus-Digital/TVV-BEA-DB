import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { QuoteItem as PrismaQuoteItemRow } from "@/generated/prisma/client";
import type { QuoteItem } from "../types/quote-item";
import type { QuoteItemRepository } from "./quote-item.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaQuoteItemRow): QuoteItem {
  return { ...row, kind: row.kind as QuoteItem["kind"], createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}

export class PrismaQuoteItemRepository implements QuoteItemRepository {
  async findById(id: string): Promise<Result<QuoteItem | null, AppError>> {
    const row = await prisma.quoteItem.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByQuote(quoteId: string): Promise<Result<QuoteItem[], AppError>> {
    const rows = await prisma.quoteItem.findMany({ where: { quoteId }, orderBy: { position: "asc" } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<QuoteItem>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.quoteItem.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.quoteItem.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<QuoteItem, "id">): Promise<Result<QuoteItem, AppError>> {
    const row = await prisma.quoteItem.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<QuoteItem, "id">>): Promise<Result<QuoteItem, AppError>> {
    try {
      const row = await prisma.quoteItem.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Quote item "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.quoteItem.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Quote item "${id}" not found`));
    }
  }
}
