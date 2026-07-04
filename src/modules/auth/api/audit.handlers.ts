import type { AppError } from "@/shared/errors";
import type { PaginatedResult, Result } from "@/shared/types";
import { getAuditLogService } from "../module";
import type { AuditLog } from "../types/audit-log";
import type { AuditLogFilter } from "../repositories/audit-log.repository";

export async function listAuditLogsHandler(filter: AuditLogFilter): Promise<Result<PaginatedResult<AuditLog>, AppError>> {
  return getAuditLogService().list(filter);
}
