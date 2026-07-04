import { NotImplementedError, type AppError } from "@/shared/errors";
import type { Logger } from "@/shared/logger";
import { ok, type Result } from "@/shared/types";
import type {
  Supplier,
  SupplierBookingConfirmation,
  SupplierBookingRequest,
  SupplierCancellationResult,
  SupplierCapability,
  SupplierHealthStatus,
  SupplierSearchCriteria,
  SupplierSearchResult,
  SupplierSyncResult,
} from "../types";

export interface SupplierAdapterContext {
  logger: Logger;
}

/**
 * Base for every placeholder adapter this sprint. initialize()/health()/
 * capabilities() are real, working implementations — none of them call an
 * external API, they're bookkeeping/metadata, so supplier registration,
 * health aggregation, and capability discovery all actually work today.
 * search()/details()/book()/cancel()/sync() require a real supplier API
 * that doesn't exist yet, so — per the explicit instruction for this sprint
 * ("Do NOT connect to any API") — they throw NotImplementedError.
 */
export abstract class BaseSupplierAdapter implements Supplier {
  protected readonly logger: Logger;

  constructor(
    public readonly code: string,
    public readonly name: string,
    context: SupplierAdapterContext
  ) {
    this.logger = context.logger;
  }

  async initialize(): Promise<Result<void, AppError>> {
    this.logger.info(`Initializing supplier adapter "${this.code}"`);
    return ok(undefined);
  }

  async health(): Promise<Result<SupplierHealthStatus, AppError>> {
    return ok({
      healthy: false,
      message: `${this.name} adapter is a placeholder — not yet implemented`,
      checkedAt: new Date().toISOString(),
    });
  }

  abstract capabilities(): SupplierCapability[];

  async search(_criteria: SupplierSearchCriteria): Promise<Result<SupplierSearchResult[], AppError>> {
    throw new NotImplementedError(`${this.name}.search() is not implemented`);
  }

  async details(_referenceId: string): Promise<Result<SupplierSearchResult, AppError>> {
    throw new NotImplementedError(`${this.name}.details() is not implemented`);
  }

  async book(_request: SupplierBookingRequest): Promise<Result<SupplierBookingConfirmation, AppError>> {
    throw new NotImplementedError(`${this.name}.book() is not implemented`);
  }

  async cancel(_bookingReference: string): Promise<Result<SupplierCancellationResult, AppError>> {
    throw new NotImplementedError(`${this.name}.cancel() is not implemented`);
  }

  async sync(): Promise<Result<SupplierSyncResult, AppError>> {
    throw new NotImplementedError(`${this.name}.sync() is not implemented`);
  }
}
