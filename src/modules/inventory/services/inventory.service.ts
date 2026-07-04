import { err, isErr, ok, type PaginatedResult, type PaginationParams, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import { InventoryStatus, type InventoryItem, type InventoryKind } from "../types";
import { validateCreateInventoryItem, validateUpdateInventoryItem } from "../validation/inventory-item.validation";
import type { InventoryRepository } from "../repositories/inventory.repository";

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
    private readonly repository: InventoryRepository
  ) {
    super(context);
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

    return this.repository.create(record);
  }

  async update(id: string, input: unknown): Promise<Result<InventoryItem, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;

    const validated = validateUpdateInventoryItem(input, existing.value.kind);
    if (isErr(validated)) return validated;

    this.logger.info("Updating inventory item", { id });
    return this.repository.update(id, validated.value as Partial<Omit<InventoryItem, "id">>);
  }

  async archive(id: string): Promise<Result<InventoryItem, AppError>> {
    const existing = await this.getById(id);
    if (isErr(existing)) return existing;

    this.logger.info("Archiving inventory item", { id });
    return this.repository.update(id, { status: InventoryStatus.ARCHIVED } as Partial<Omit<InventoryItem, "id">>);
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    this.logger.warn("Hard-deleting inventory item", { id });
    return this.repository.delete(id);
  }
}
