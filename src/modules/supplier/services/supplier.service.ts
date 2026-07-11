import { AppError, ConflictError, NotFoundError } from "@/shared/errors";
import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import {
  SupplierRecordStatus,
  type Supplier,
  type SupplierCapability,
  type SupplierHealthStatus,
  type SupplierRecord,
  type SupplierBookingRequest,
  type SupplierBookingConfirmation,
  type SupplierSearchCriteria,
  type SupplierSearchResult,
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

  async search(code: string, criteria: SupplierSearchCriteria): Promise<Result<SupplierSearchResult[], AppError>> {
    const supplier = this.registry.getSupplier(code);
    if (!supplier) return err(new NotFoundError(`Supplier "${code}" not found`));
    return supplier.search(criteria);
  }

  async book(code: string, request: SupplierBookingRequest): Promise<Result<SupplierBookingConfirmation, AppError>> {
    const supplier = this.registry.getSupplier(code);
    if (!supplier) return err(new NotFoundError(`Supplier "${code}" not found`));
    return supplier.book(request);
  }

  /**
   * Review-then-Book flow required by TripJack for flights.
   * TripJack OMS rejects book() calls that don't have a prior review().
   * This method:
   *  1. Calls review on the TripJack adapter to get a live bookingId
   *  2. Passes that bookingId to book()
   * Non-TripJack suppliers fall back to a direct book().
   */
  async reviewAndBook(code: string, request: SupplierBookingRequest): Promise<Result<SupplierBookingConfirmation, AppError>> {
    const supplier = this.registry.getSupplier(code);
    if (!supplier) return err(new NotFoundError(`Supplier "${code}" not found`));

    // TripJack-specific: review() must be called before book() for flights
    if (code === "tripjack" && typeof (supplier as any).reviewFlight === "function") {
      // Decode the referenceId to get resultIndex and traceId for the review call
      const parts = request.referenceId.split("::");
      if (parts.length === 3 && parts[0] === "FLIGHT") {
        const [, resultIndex, traceId] = parts;
        const reviewResult = await (supplier as any).reviewFlight(resultIndex, traceId);
        if (!reviewResult.ok) {
          this.logger.error("TripJack flight review failed before book attempt", { error: reviewResult.error.message });
          return reviewResult;
        }
        // Use the bookingId from review as the reference for the actual book call
        const reviewedBookingId: string = reviewResult.value.bookingId ?? resultIndex;
        return supplier.book({ ...request, reviewedBookingId });
      }
    }

    // Fallback for hotels or non-TripJack suppliers
    return supplier.book(request);
  }
}
