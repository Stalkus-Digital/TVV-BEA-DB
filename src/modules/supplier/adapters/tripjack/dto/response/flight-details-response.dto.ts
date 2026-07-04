import type { TripJackFlightSearchResultDTO } from "./flight-search-response.dto";

export interface TripJackFlightDetailsResponseDTO extends TripJackFlightSearchResultDTO {
  baggageAllowance?: string;
  refundable: boolean;
}
