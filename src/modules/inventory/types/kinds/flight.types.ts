/**
 * A FLIGHT-kind item represents a Route (an origin/destination airport
 * pair), not a bookable flight — schedules and fares are always
 * supplier-live and are never persisted as catalog (see
 * INVENTORY_SYSTEM.md §3.3 / docs/05_INVENTORY_ENGINE.md). This detail type
 * is deliberately thin as a result.
 */
export interface FlightRouteDetails {
  originAirportCode: string;
  destinationAirportCode: string;
}
