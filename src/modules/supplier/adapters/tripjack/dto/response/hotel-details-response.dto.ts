import type { TripJackHotelSearchResultDTO } from "./hotel-search-response.dto";

export interface TripJackHotelDetailsResponseDTO extends TripJackHotelSearchResultDTO {
  amenities: string[];
  cancellationPolicy?: string;
}
