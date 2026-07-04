import { type PaginatedResult, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import type { AuditEventType, AuditLog } from "../types/audit-log";
import type { AuditLogFilter, AuditLogRepository } from "../repositories/audit-log.repository";

export interface RecordAuditEventInput {
  eventType: AuditEventType;
  actorUserId: string | null;
  targetUserId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/** Append-only — no update/delete exposed beyond what BaseRepository technically allows; nothing in this module ever calls them. */
export class AuditLogService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly auditLogs: AuditLogRepository
  ) {
    super(context);
  }

  async record(input: RecordAuditEventInput): Promise<Result<AuditLog, AppError>> {
    return this.auditLogs.create({
      eventType: input.eventType,
      actorUserId: input.actorUserId,
      targetUserId: input.targetUserId ?? null,
      details: input.details ?? null,
      ipAddress: input.ipAddress ?? null,
      occurredAt: new Date().toISOString(),
    });
  }

  async list(filter: AuditLogFilter = {}): Promise<Result<PaginatedResult<AuditLog>, AppError>> {
    return this.auditLogs.findByFilter(filter);
  }
}
