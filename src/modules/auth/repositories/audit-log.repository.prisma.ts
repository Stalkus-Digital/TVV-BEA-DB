import { err, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { Prisma, AuditLog as PrismaAuditLogRow } from "@/generated/prisma/client";
import type { AuditLog } from "../types/audit-log";
import type { AuditLogFilter, AuditLogRepository } from "./audit-log.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toDomain(row: PrismaAuditLogRow): AuditLog {
  return {
    ...row,
    eventType: row.eventType as AuditLog["eventType"],
    details: row.details as unknown as AuditLog["details"],
    occurredAt: row.occurredAt.toISOString(),
  };
}

export class PrismaAuditLogRepository implements AuditLogRepository {
  async findById(id: string): Promise<Result<AuditLog | null, AppError>> {
    const row = await prisma.auditLog.findUnique({ where: { id } });
    return ok(row ? toDomain(row) : null);
  }

  async findMany(params: PaginationParams = {}): Promise<Result<PaginatedResult<AuditLog>, AppError>> {
    return this.findByFilter(params);
  }

  async findByFilter(filter: AuditLogFilter): Promise<Result<PaginatedResult<AuditLog>, AppError>> {
    const page = filter.page ?? DEFAULT_PAGE;
    const pageSize = filter.pageSize ?? DEFAULT_PAGE_SIZE;
    const where: Prisma.AuditLogWhereInput = {};
    if (filter.eventType) where.eventType = filter.eventType;
    if (filter.actorUserId) where.actorUserId = filter.actorUserId;

    const [rows, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { occurredAt: "desc" } }),
      prisma.auditLog.count({ where }),
    ]);
    return ok({ items: rows.map(toDomain), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }

  async create(data: Omit<AuditLog, "id">): Promise<Result<AuditLog, AppError>> {
    const row = await prisma.auditLog.create({ data: { ...data, details: data.details !== null ? (data.details as object) : undefined } });
    return ok(toDomain(row));
  }

  async update(id: string, data: Partial<Omit<AuditLog, "id">>): Promise<Result<AuditLog, AppError>> {
    try {
      const row = await prisma.auditLog.update({
        where: { id },
        data: { ...data, details: data.details !== undefined ? (data.details as object) : undefined },
      });
      return ok(toDomain(row));
    } catch {
      return err(new NotFoundError(`Audit log entry "${id}" not found`));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.auditLog.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new NotFoundError(`Audit log entry "${id}" not found`));
    }
  }
}
