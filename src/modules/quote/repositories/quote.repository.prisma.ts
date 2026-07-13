import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, ConflictError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Prisma, Quote as PrismaQuoteRow } from "@/generated/prisma/client";
import type { Quote } from "../types/quote";
import type { QuoteListFilter, QuoteRepository } from "./quote.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaQuoteRow): Quote {
  return {
    ...row,
    status: row.status as Quote["status"],
    travelerDetails: row.travelerDetails as unknown as Quote["travelerDetails"],
    adjustments: row.adjustments as unknown as Quote["adjustments"],
    validFrom: row.validFrom.toISOString(),
    validTo: row.validTo.toISOString(),
    approvedAt: row.approvedAt?.toISOString() ?? null,
    rejectedAt: row.rejectedAt?.toISOString() ?? null,
    convertedAt: row.convertedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toWhere(filter: QuoteListFilter): Prisma.QuoteWhereInput {
  const where: Prisma.QuoteWhereInput = {};
  if (filter.status) where.status = filter.status;
  if (filter.destinationId) where.destinationId = filter.destinationId;
  if (filter.packageId) where.packageId = filter.packageId;
  if (filter.customerId) where.customerId = filter.customerId;
  return where;
}

export class PrismaQuoteRepository implements QuoteRepository {
  async findById(id: string): Promise<Result<Quote | null, AppError>> {
    const row = await prisma.quote.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByNumber(quoteNumber: string): Promise<Result<Quote | null, AppError>> {
    const row = await prisma.quote.findUnique({ where: { quoteNumber } });
    return ok(row ? toDomain(row) : null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<Quote>, AppError>> {
    return this.findByFilter(params);
  }

  async findByFilter(filter: QuoteListFilter): Promise<Result<PaginatedResult<Quote>, AppError>> {
    const page = filter.page ?? DEFAULT_PAGE;
    const pageSize = filter.pageSize ?? DEFAULT_PAGE_SIZE;
    const where = toWhere(filter);
    const [rows, total] = await Promise.all([
      prisma.quote.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
      prisma.quote.count({ where }),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async countAll(): Promise<Result<number, AppError>> {
    return ok(await prisma.quote.count());
  }

  async create(data: Omit<Quote, "id">): Promise<Result<Quote, AppError>> {
    try {
      const row = await prisma.quote.create({
        data: {
          ...data,
          travelerDetails: data.travelerDetails as object,
          adjustments: data.adjustments as unknown as object,
          validFrom: new Date(data.validFrom),
          validTo: new Date(data.validTo),
        },
      });
      return ok(toDomain(row));
    } catch (e: any) {
      if (e?.code === "P2002") {
        return err(new ConflictError(`Quote number ${data.quoteNumber} already exists`));
      }
      throw e; // Let it bubble to a 500 if it's a real DB outage
    }
  }

  async update(id: string, data: Partial<Omit<Quote, "id">>): Promise<Result<Quote, AppError>> {
    try {
      const row = await prisma.quote.update({
        where: { id },
        data: {
          ...data,
          travelerDetails: data.travelerDetails !== undefined ? (data.travelerDetails as object) : undefined,
          adjustments: data.adjustments !== undefined ? (data.adjustments as unknown as object) : undefined,
          validFrom: data.validFrom !== undefined ? new Date(data.validFrom) : undefined,
          validTo: data.validTo !== undefined ? new Date(data.validTo) : undefined,
        },
      });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Quote "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.quote.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Quote "${id}" not found`));
    }
  }
}
