import { AppError, ConflictError, NotFoundError } from "@/shared/errors";
import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import {
  SupplierRecordStatus,
  type Supplier,
  type SupplierCapability,
  type SupplierHealthStatus,
  type SupplierRecord,
} from "../types";
import type { SupplierRecordRepository } from "../repositories/supplier-record.repository";
import type { SupplierRegistry } from "./supplier-registry";

/**
 * Orchestrates registration/lookup — never itself the thing that calls a
 * supplier's search/book/cancel/sync. Those still throw NotImplementedError
 * at the adapter, and nothing in this sprint calls them.
 */
export class SupplierService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly registry: SupplierRegistry,
    private readonly repository: SupplierRecordRepository
  ) {
    super(context);
  }

  async registerSupplier(supplier: Supplier): Promise<Result<SupplierRecord, AppError>> {
    const initResult = await supplier.initialize();
    if (isErr(initResult)) return initResult;

    try {
      this.registry.register(supplier);
    } catch (error) {
      return err(
        error instanceof AppError ? error : new ConflictError(`Failed to register supplier "${supplier.code}"`)
      );
    }

    this.logger.info("Supplier registered", { code: supplier.code, capabilities: supplier.capabilities() });

    return this.repository.create({
      code: supplier.code,
      name: supplier.name,
      capabilities: supplier.capabilities(),
      status: SupplierRecordStatus.ACTIVE,
      registeredAt: new Date().toISOString(),
    });
  }

  async listSuppliers(capability?: SupplierCapability): Promise<Result<SupplierRecord[], AppError>> {
    const result = await this.repository.findMany();
    if (isErr(result)) return result;
    const items = capability
      ? result.value.items.filter((record) => record.capabilities.includes(capability))
      : result.value.items;
    return ok(items);
  }

  async getSupplierByCode(code: string): Promise<Result<SupplierRecord, AppError>> {
    const result = await this.repository.findByCode(code);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Supplier "${code}" not found`));
    return ok(result.value);
  }

  async getSupplierHealth(code: string): Promise<Result<SupplierHealthStatus, AppError>> {
    const supplier = this.registry.getSupplier(code);
    if (!supplier) return err(new NotFoundError(`Supplier "${code}" not found`));
    return supplier.health();
  }
}
