import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import type { SupplierCapability } from "./supplier-capability";

export interface SupplierHealthStatus {
  healthy: boolean;
  message?: string;
  checkedAt: string;
}

/**
 * Deliberately loose shapes — no supplier is implemented yet (this sprint is
 * placeholders only), so there is no real search/booking payload to model
 * precisely. These get replaced with concrete per-capability shapes when
 * TripJack (docs/10_TRIPJACK_INTEGRATION.md) is actually built. Nothing here
 * should be treated as a finished contract.
 */
export interface SupplierSearchCriteria {
  capability: SupplierCapability;
  [key: string]: unknown;
}

export interface SupplierSearchResult {
  referenceId: string;
  [key: string]: unknown;
}

export interface SupplierBookingRequest {
  referenceId: string;
  [key: string]: unknown;
}

export interface SupplierBookingConfirmation {
  confirmationReference: string;
  [key: string]: unknown;
}

export interface SupplierCancellationResult {
  cancelled: boolean;
  [key: string]: unknown;
}

export interface SupplierSyncResult {
  syncedAt: string;
  recordsProcessed: number;
  [key: string]: unknown;
}

/**
 * Every supplier — TripJack, Ferry, Manual, and every future supplier —
 * implements this and only this. Business modules never hold a reference to
 * a concrete adapter; only the SupplierRegistry does, and only the
 * Inventory Engine is meant to ask the registry for one (see
 * docs/02_SYSTEM_ARCHITECTURE.md's Communication Rules).
 */
export interface Supplier {
  readonly code: string;
  readonly name: string;

  initialize(): Promise<Result<void, AppError>>;
  health(): Promise<Result<SupplierHealthStatus, AppError>>;
  capabilities(): SupplierCapability[];
  search(criteria: SupplierSearchCriteria): Promise<Result<SupplierSearchResult[], AppError>>;
  details(referenceId: string): Promise<Result<SupplierSearchResult, AppError>>;
  book(request: SupplierBookingRequest): Promise<Result<SupplierBookingConfirmation, AppError>>;
  cancel(bookingReference: string): Promise<Result<SupplierCancellationResult, AppError>>;
  sync(): Promise<Result<SupplierSyncResult, AppError>>;
}
