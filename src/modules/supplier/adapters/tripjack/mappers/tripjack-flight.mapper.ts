import type { TripJackFlightSearchResultDTO } from "../dto";

/**
 * Mirrors Inventory's FlightRouteDetails structurally (same field names/
 * semantics) WITHOUT importing anything from src/modules/inventory — the
 * Supplier Engine stays completely isolated (binding rule from Sprint 3).
 * "TripJack DTOs must never leak into business models" is satisfied by this
 * mapper's output being a clean, TripJack-free plain object — not by
 * importing Inventory's types directly, which would violate isolation
 * instead. Wiring this output into a real InventoryItem is future
 * integration work through inventory-supplier-bridge.ts, not this sprint.
 */
export interface MappedInventoryFlight {
  originAirportCode: string;
  destinationAirportCode: string;
  title: string;
}

export class TripJackFlightMapper {
  toInventoryFlight(dto: TripJackFlightSearchResultDTO): MappedInventoryFlight {
    return {
      originAirportCode: dto.origin,
      destinationAirportCode: dto.destination,
      title: `${dto.origin} → ${dto.destination}`,
    };
  }
}
