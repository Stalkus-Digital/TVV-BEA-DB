/**
 * Flight domain model.
 *
 * Designed for an aggregator-style integration (the backend can wrap whichever
 * supplier — TripJack air, TBO, an airline API). Frontend code stays stable.
 */

export type CabinClass = "economy" | "premium-economy" | "business" | "first";
export type TripType = "one-way" | "round-trip" | "multi-city";

export interface Airport {
  code: string;          // IATA — e.g. "BLR"
  name: string;
  city: string;
  countryCode: string;
}

export interface Airline {
  code: string;          // e.g. "6E"
  name: string;          // e.g. "IndiGo"
  logoUrl?: string;
}

export interface FlightSegment {
  segmentId: string;
  airline: Airline;
  flightNumber: string;
  from: Airport;
  to: Airport;
  departure: string;     // ISO datetime
  arrival: string;       // ISO datetime
  durationMinutes: number;
  cabin: CabinClass;
  fareClass?: string;
  baggageKg?: number;
}

export interface FlightLeg {
  legId: string;
  segments: FlightSegment[];
  stops: number;
  totalDurationMinutes: number;
}

export interface FlightFare {
  totalPrice: number;
  basePrice: number;
  taxes: number;
  currency: "INR";
  refundable: boolean;
  fareType?: "publish" | "discounted" | "corporate";
}

export interface FlightItinerary {
  itineraryId: string;
  legs: FlightLeg[];
  fare: FlightFare;
  /** True if all segments are operated by the same airline. */
  singleAirline: boolean;
  vendor?: string;
}

export interface FlightSearchInput {
  from: string;
  to: string;
  departDate: string;        // YYYY-MM-DD
  returnDate?: string;
  tripType: TripType;
  adults: number;
  children?: number;
  infants?: number;
  cabin?: CabinClass;
}

export interface FlightSearchResponse {
  query: FlightSearchInput;
  results: FlightItinerary[];
  meta?: {
    total: number;
    fetchedAt: string;
    vendors: string[];
  };
}
