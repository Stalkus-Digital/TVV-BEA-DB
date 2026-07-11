/**
 * TripJack Flight Search Request — POST /fms/v1/air-search-all
 * Source: TripJack Flights API v2.0.2 official documentation
 *
 * Journey types:
 *  - Oneway:     1 routeInfo entry
 *  - Return:     2 routeInfo entries
 *  - Multi-City: 2–6 routeInfo entries
 */
export interface TripJackAirportCodeDTO {
  code: string; // IATA airport or city code e.g. "DEL"
}

export interface TripJackRouteInfoDTO {
  fromCityOrAirport: TripJackAirportCodeDTO;
  toCityOrAirport: TripJackAirportCodeDTO;
  travelDate: string; // YYYY-MM-DD
}

export interface TripJackPaxInfoDTO {
  ADULT: number;    // min 1
  CHILD?: number;   // age 2–12
  INFANT?: number;  // age 0–2, must be ≤ ADULT count
}

export interface TripJackSearchModifiersDTO {
  isDirectFlight?: boolean;
  isConnectingFlight?: boolean;
  pfts?: "REGULAR" | "STUDENT" | "SENIOR_CITIZEN"; // default: REGULAR
}

export interface TripJackFlightSearchRequestDTO {
  searchQuery: {
    cabinClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"; // default: ECONOMY
    paxInfo: TripJackPaxInfoDTO;
    routeInfos: TripJackRouteInfoDTO[];
    searchModifiers?: TripJackSearchModifiersDTO;
    preferredAirline?: { code: string }[]; // max 10 airline codes
  };
}
