import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { PassengerDocument as PrismaPassengerDocumentRow } from "@/generated/prisma/client";
import type { PassengerDocument } from "../types/document";
import type { DocumentRepository } from "./document.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaPassengerDocumentRow): PassengerDocument {
  return {
    ...row,
    kind: row.kind as PassengerDocument["kind"],
    issuedAt: row.issuedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export class PrismaDocumentRepository implements DocumentRepository {
  async findById(id: string): Promise<Result<PassengerDocument | null, AppError>> {
    const row = await prisma.passengerDocument.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findByBooking(bookingId: string): Promise<Result<PassengerDocument[], AppError>> {
    const rows = await prisma.passengerDocument.findMany({ where: { bookingId } });
    return ok(rows.map(toDomain));
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<PassengerDocument>, AppError>> {
    const page = params.page ?? DEFAULT_PAGE;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.passengerDocument.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.passengerDocument.count(),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<PassengerDocument, "id">): Promise<Result<PassengerDocument, AppError>> {
    const row = await prisma.passengerDocument.create({ data });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<PassengerDocument, "id">>): Promise<Result<PassengerDocument, AppError>> {
    try {
      const row = await prisma.passengerDocument.update({ where: { id }, data });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Passenger document "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.passengerDocument.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Passenger document "${id}" not found`));
    }
  }
}
