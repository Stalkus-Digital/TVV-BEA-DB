import { DEFAULT_PAGINATION, ok, toPaginatedResult, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { AuditEventType, AuditLog } from "../types/audit-log";
import { PrismaStore } from "@/shared/database/prisma-store";
import { prisma } from "@/shared/database/prisma-client";

export interface AuditLogFilter extends PaginationParams {
  eventType?: AuditEventType;
  actorUserId?: string;
}

export interface AuditLogRepository extends BaseRepository<AuditLog, string> {
  findByFilter(filter: AuditLogFilter): Promise<Result<PaginatedResult<AuditLog>, AppError>>;
}

export class PrismaAuditLogRepository extends PrismaStore<any> implements AuditLogRepository {
  constructor() {
    super(prisma.auditLog);
  }

  async findByFilter(filter: AuditLogFilter): Promise<Result<PaginatedResult<AuditLog>, AppError>> {
    let items = (await this.delegate.findMany()).sort(( a: any, b: any ) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    if (filter.eventType) items = items.filter(( l: any ) => l.eventType === filter.eventType);
    if (filter.actorUserId) items = items.filter(( l: any ) => l.actorUserId === filter.actorUserId);

    const page = filter.page ?? DEFAULT_PAGINATION.page;
    const pageSize = filter.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }
}
