/**
 * What TripJack itself claims to support, at TripJack's own granularity —
 * distinct from (but the source of) the Supplier Engine-level
 * `capabilities(): SupplierCapability[]` the registry uses for discovery
 * (see ../index.ts). This is internal metadata about the connector, not the
 * public capability-discovery contract.
 */
export const TripJackCapabilities = {
  FLIGHT_SEARCH: "FLIGHT_SEARCH",
  FLIGHT_DETAILS: "FLIGHT_DETAILS",
  HOTEL_SEARCH: "HOTEL_SEARCH",
  HOTEL_DETAILS: "HOTEL_DETAILS",
  BOOKING: "BOOKING",
  CANCELLATION: "CANCELLATION",
  FARE_RULES: "FARE_RULES",
  SSR: "SSR",
  SEAT_MAP: "SEAT_MAP",
} as const;

export type TripJackCapability = (typeof TripJackCapabilities)[keyof typeof TripJackCapabilities];

export const TRIPJACK_CAPABILITIES: TripJackCapability[] = Object.values(TripJackCapabilities);
