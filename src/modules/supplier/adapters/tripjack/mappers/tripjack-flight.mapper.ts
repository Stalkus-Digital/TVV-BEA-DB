import type { TripJackSegmentInfoDTO } from "../dto/response/flight-search-response.dto";

/**
 * Maps TripJack raw segment data to a clean internal flight representation.
 *
 * Mirrors Inventory's FlightRouteDetails structurally (same field names/
 * semantics) WITHOUT importing anything from src/modules/inventory — the
 * Supplier Engine stays completely isolated (binding rule from Sprint 3).
 * "TripJack DTOs must never leak into business models" is satisfied by this
 * mapper's output being a clean, TripJack-free plain object.
 */
export interface MappedInventoryFlight {
  originAirportCode: string;
  destinationAirportCode: string;
  originCity?: string;
  destinationCity?: string;
  title: string;
  airline?: string;
  airlineCode?: string;
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  durationMinutes?: number;
  cabinBaggage?: string;
  checkInBaggage?: string;
}

export class TripJackFlightMapper {
  /**
   * Maps a TripJack segment (sI entry) to a clean internal flight object.
   * The segment is the real unit from the search response — not the old flat DTO.
   */
  toInventoryFlight(segment: TripJackSegmentInfoDTO): MappedInventoryFlight {
    const origin = segment.da.code;
    const destination = segment.aa.code;
    return {
      originAirportCode: origin,
      destinationAirportCode: destination,
      originCity: segment.da.city,
      destinationCity: segment.aa.city,
      title: `${segment.fD.aI.name} ${segment.fD.fN}: ${origin} → ${destination}`,
      airline: segment.fD.aI.name,
      airlineCode: segment.fD.aI.code,
      flightNumber: segment.fD.fN,
      departureTime: segment.dt,
      arrivalTime: segment.at,
      durationMinutes: segment.duration,
      cabinBaggage: segment.bI?.cB,
      checkInBaggage: segment.bI?.iB,
    };
  }
}
