import { DEFAULT_PAGINATION, ok, toPaginatedResult, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import type { BaseRepository } from "@/shared/repositories";
import type { AppError } from "@/shared/errors";
import type { AuditEventType, AuditLog } from "../types/audit-log";
import { InMemoryStore } from "./in-memory-store";

export interface AuditLogFilter extends PaginationParams {
  eventType?: AuditEventType;
  actorUserId?: string;
}

export interface AuditLogRepository extends BaseRepository<AuditLog, string> {
  findByFilter(filter: AuditLogFilter): Promise<Result<PaginatedResult<AuditLog>, AppError>>;
}

export class InMemoryAuditLogRepository implements AuditLogRepository {
  private readonly store = new InMemoryStore<AuditLog>("Audit log entry");

  findById = (id: string) => this.store.findById(id);
  findMany = (params?: PaginationParams) => this.store.findMany(params);
  create = (data: Omit<AuditLog, "id">) => this.store.create(data);
  update = (id: string, data: Partial<Omit<AuditLog, "id">>) => this.store.update(id, data);
  delete = (id: string) => this.store.delete(id);

  async findByFilter(filter: AuditLogFilter): Promise<Result<PaginatedResult<AuditLog>, AppError>> {
    let items = this.store.all().sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    if (filter.eventType) items = items.filter((l) => l.eventType === filter.eventType);
    if (filter.actorUserId) items = items.filter((l) => l.actorUserId === filter.actorUserId);

    const page = filter.page ?? DEFAULT_PAGINATION.page;
    const pageSize = filter.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const start = (page - 1) * pageSize;
    return ok(toPaginatedResult(items.slice(start, start + pageSize), items.length, { page, pageSize }));
  }
}
