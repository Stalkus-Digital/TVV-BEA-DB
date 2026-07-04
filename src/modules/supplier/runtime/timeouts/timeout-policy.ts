import { SupplierCapability } from "../../types/supplier-capability";
import { RuntimeConfigService } from "../config.service";

/** Mirrors the 5 throwing methods on the `Supplier` port — the operation being timed, independent of which capability it's for. */
export const SupplierOperation = {
  SEARCH: "SEARCH",
  DETAILS: "DETAILS",
  BOOK: "BOOK",
  CANCEL: "CANCEL",
  SYNC: "SYNC",
} as const;

export type SupplierOperation = (typeof SupplierOperation)[keyof typeof SupplierOperation];

/**
 * This sprint names four timeout categories — "Hotels, Flights, Booking,
 * Cancellation" — that don't map onto a single axis: Hotels/Flights are
 * `SupplierCapability` values, while Booking/Cancellation are operations
 * (any capability's `book()`/`cancel()` call). Resolved as: `book`/`cancel`
 * always use their own timeout regardless of capability (a booking commit
 * is a booking commit whether it's a hotel or a flight); every other
 * operation resolves by capability where a specific one is configured
 * (Hotels, Flights today), falling back to a configured default for every
 * other capability (Activities, Ferries, Transfers, Visa, Insurance) so no
 * capability is ever left without a timeout.
 */
export function resolveTimeoutMs(operation: SupplierOperation, capability: SupplierCapability): number {
  const config = RuntimeConfigService.getInstance();

  if (operation === SupplierOperation.BOOK) return config.get("timeoutBookingMs");
  if (operation === SupplierOperation.CANCEL) return config.get("timeoutCancellationMs");

  if (capability === SupplierCapability.HOTELS) return config.get("timeoutHotelsMs");
  if (capability === SupplierCapability.FLIGHTS) return config.get("timeoutFlightsMs");

  return config.get("timeoutDefaultMs");
}
