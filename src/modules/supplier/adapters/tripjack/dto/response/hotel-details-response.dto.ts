import type { TripJackHotelOptionDTO } from "./hotel-search-response.dto";

/**
 * TripJack Hotel Detail Dynamic Response — POST /hms/v3/hotel/pricing
 * Source: TripJack Hotels API v3.0
 */

export interface TripJackHotelDetailsResponseDTO {
  tjHotelId: string;
  hotelName: string;
  nationality?: string;
  options: TripJackHotelOptionDTO[];
  reviewHash: string;
  status: {
    success: boolean;
    httpStatus?: number;
  };
  correlationId?: string;
}
