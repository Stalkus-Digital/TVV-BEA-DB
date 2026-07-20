import { err, isErr, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import { InventoryStatus, type InventoryItem, type InventoryKind } from "../types";
import { validateCreateInventoryItem, validateUpdateInventoryItem } from "../validation/inventory-item.validation";
import type { InventoryRepository } from "../repositories/inventory.repository";
import type { AuditLogService } from "@/modules/auth/audit/audit-log.service";
import type { AuditEventType } from "@/modules/auth/types/audit-log";

export interface ListInventoryParams extends PaginationParams {
  kind?: InventoryKind;
}

/**
 * CRUD orchestration for the Inventory bounded context. Kind-agnostic:
 * knows nothing about hotels/flights/etc. specifically — that lives in the
 * validation layer's per-kind validators. Knows nothing about suppliers —
 * see module.ts for the provider-agnosticism note.
 */
export class InventoryService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly repository: InventoryRepository,
    private readonly auditLog?: AuditLogService
  ) {
    super(context);
  }

  private async recordAudit(
    eventType: AuditEventType,
    item: InventoryItem,
    action: string,
    details?: Record<string, unknown>
  ) {
    if (!this.auditLog) return;
    await this.auditLog.record({
      eventType,
      actorUserId: null,
      details: {
        inventoryId: item.id,
        inventoryTitle: item.title,
        inventoryKind: item.kind,
        action,
        ...details,
      },
    });
  }

  async list(params: ListInventoryParams = {}): Promise<Result<PaginatedResult<InventoryItem>, AppError>> {
    this.logger.debug("Listing inventory items", { kind: params.kind, page: params.page });
    if (params.kind) return this.repository.findByKind(params.kind, params);
    return this.repository.findMany(params);
  }

  async getById(id: string): Promise<Result<InventoryItem, AppError>> {
    const result = await this.repository.findById(id);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Inventory item "${id}" not found`));
    return ok(result.value);
  }

  async create(input: unknown): Promise<Result<InventoryItem, AppError>> {
    const validated = validateCreateInventoryItem(input);
    if (isErr(validated)) return validated;

    this.logger.info("Creating inventory item", { kind: validated.value.kind, title: validated.value.title });

    const now = new Date().toISOString();
    const record = {
      kind: validated.value.kind,
      destinationId: validated.value.destinationId,
      title: validated.value.title,
      status: InventoryStatus.DRAFT,
      details: validated.value.details,
      createdAt: now,
      updatedAt: now,
    } as Omit<InventoryItem, "id">;

    const result = await this.repository.create(record);
    if (!isErr(result)) {
      await this.recordAudit("INVENTORY_CREATED", result.value, `Created ${result.value.kind.toLowerCase()}`, {
        status: result.value.status,
      });
    }
    return result;
  }

  async update(id: string, input: unknown): Promise<Result<InventoryItem, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;

    const validated = validateUpdateInventoryItem(input, existing.value.kind);
    if (isErr(validated)) return validated;

    this.logger.info("Updating inventory item", { id });
    const result = await this.repository.update(id, validated.value as Partial<Omit<InventoryItem, "id">>);
    if (!isErr(result)) {
      const changes: Record<string, { from: unknown; to: unknown }> = {};
      if (existing.value.title !== result.value.title) {
        changes.title = { from: existing.value.title, to: result.value.title };
      }
      if (existing.value.status !== result.value.status) {
        changes.status = { from: existing.value.status, to: result.value.status };
      }
      if (existing.value.destinationId !== result.value.destinationId) {
        changes.destinationId = { from: existing.value.destinationId, to: result.value.destinationId };
      }
      await this.recordAudit("INVENTORY_UPDATED", result.value, `Updated ${result.value.kind.toLowerCase()}`, {
        changes,
      });
    }
    return result;
  }

  async archive(id: string): Promise<Result<InventoryItem, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;

    this.logger.info("Archiving inventory item", { id });
    const result = await this.repository.update(id, {
      status: InventoryStatus.ARCHIVED,
    } as Partial<Omit<InventoryItem, "id">>);
    if (!isErr(result)) {
      await this.recordAudit("INVENTORY_ARCHIVED", result.value, `Archived ${result.value.kind.toLowerCase()}`, {
        previousStatus: existing.value.status,
      });
    }
    return result;
  }

  async publish(id: string): Promise<Result<InventoryItem, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;

    this.logger.info("Publishing inventory item", { id });
    const result = await this.repository.update(id, {
      status: InventoryStatus.ACTIVE,
    } as Partial<Omit<InventoryItem, "id">>);
    if (!isErr(result)) {
      await this.recordAudit("INVENTORY_PUBLISHED", result.value, `Published ${result.value.kind.toLowerCase()}`, {
        previousStatus: existing.value.status,
        newStatus: InventoryStatus.ACTIVE,
      });
    }
    return result;
  }

  async unpublish(id: string): Promise<Result<InventoryItem, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;

    this.logger.info("Unpublishing inventory item", { id });
    const result = await this.repository.update(id, {
      status: InventoryStatus.DRAFT,
    } as Partial<Omit<InventoryItem, "id">>);
    if (!isErr(result)) {
      await this.recordAudit("INVENTORY_UNPUBLISHED", result.value, `Unpublished ${result.value.kind.toLowerCase()}`, {
        previousStatus: existing.value.status,
        newStatus: InventoryStatus.DRAFT,
      });
    }
    return result;
  }

  async restore(id: string): Promise<Result<InventoryItem, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;

    this.logger.info("Restoring inventory item", { id });
    const result = await this.repository.update(id, {
      status: InventoryStatus.DRAFT,
    } as Partial<Omit<InventoryItem, "id">>);
    if (!isErr(result)) {
      await this.recordAudit("INVENTORY_RESTORED", result.value, `Restored ${result.value.kind.toLowerCase()}`, {
        previousStatus: existing.value.status,
        newStatus: InventoryStatus.DRAFT,
      });
    }
    return result;
  }

  async duplicate(id: string): Promise<Result<InventoryItem, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;

    const source = existing.value;
    this.logger.info("Duplicating inventory item", { id });
    const now = new Date().toISOString();
    const result = await this.repository.create({
      kind: source.kind,
      destinationId: source.destinationId,
      title: `${source.title} (Copy)`,
      status: InventoryStatus.DRAFT,
      details: source.details,
      createdAt: now,
      updatedAt: now,
    } as Omit<InventoryItem, "id">);
    if (!isErr(result)) {
      await this.recordAudit("INVENTORY_DUPLICATED", result.value, `Duplicated ${source.kind.toLowerCase()}`, {
        sourceId: source.id,
        sourceTitle: source.title,
      });
    }
    return result;
  }

  async bulkUpdateStatus(ids: string[], status: InventoryStatus): Promise<Result<{ updated: number }, AppError>> {
    let updated = 0;
    for (const id of ids) {
      const existing = await this.getById(id);
      if (isErr(existing)) continue;
      const result = await this.repository.update(id, { status } as Partial<Omit<InventoryItem, "id">>);
      if (!isErr(result)) {
        updated++;
        const eventType =
          status === InventoryStatus.ACTIVE
            ? "INVENTORY_PUBLISHED"
            : status === InventoryStatus.ARCHIVED
              ? "INVENTORY_ARCHIVED"
              : "INVENTORY_UNPUBLISHED";
        await this.recordAudit(eventType, result.value, `Bulk status change to ${status}`, {
          previousStatus: existing.value.status,
          bulk: true,
        });
      }
    }
    return ok({ updated });
  }

  async bulkArchive(ids: string[]): Promise<Result<{ archived: number }, AppError>> {
    const result = await this.bulkUpdateStatus(ids, InventoryStatus.ARCHIVED);
    if (isErr(result)) return result;
    return ok({ archived: result.value.updated });
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    this.logger.warn("Hard-deleting inventory item", { id });
    return this.repository.delete(id);
  }
}
