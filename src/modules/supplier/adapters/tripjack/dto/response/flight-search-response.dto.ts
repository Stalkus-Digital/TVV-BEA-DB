export interface TripJackFlightSearchResultDTO {
  resultIndex: string;
  traceId: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  fare: number;
  currency: string;
}

export interface TripJackFlightSearchResponseDTO {
  results: TripJackFlightSearchResultDTO[];
}
