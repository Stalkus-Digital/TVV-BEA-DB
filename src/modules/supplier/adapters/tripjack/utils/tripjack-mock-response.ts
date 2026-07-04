import type { TripJackFlightSearchResultDTO, TripJackHotelSearchResultDTO } from "../dto";

/**
 * Deterministic placeholder payloads — used only so downstream code
 * (mappers, response parser) has something realistic-shaped to exercise
 * before any live response ever exists. Never returned by TripJackClient
 * itself (the client throws NotImplementedError); this is a separate,
 * explicit opt-in for demonstration/manual testing only.
 */
export function mockFlightSearchResult(): TripJackFlightSearchResultDTO {
  return {
    resultIndex: "MOCK-RESULT-1",
    traceId: "MOCK-TRACE-1",
    airline: "MOCK-AIR",
    flightNumber: "MOCK-101",
    origin: "DEL",
    destination: "IXZ",
    departureTime: "2026-01-01T06:00:00.000Z",
    arrivalTime: "2026-01-01T09:00:00.000Z",
    fare: 0,
    currency: "INR",
  };
}

export function mockHotelSearchResult(): TripJackHotelSearchResultDTO {
  return {
    hotelId: "MOCK-HOTEL-1",
    traceId: "MOCK-TRACE-1",
    name: "Mock Placeholder Hotel",
    starRating: 0,
    address: "Not a real address",
    nightlyRate: 0,
    currency: "INR",
  };
}
