import type { TripJackHotelOptionDTO } from "./hotel-search-response.dto";

/**
 * TripJack Hotel Review Response — POST /hms/v3/hotel/review
 * Source: TripJack Hotels API v3.0
 */

export interface TripJackHotelReviewResponseDTO {
  correlationId?: string;
  tjHotelId: string;
  hotelName: string;
  bookingId: string;
  option: TripJackHotelOptionDTO & { deadlineDateTime?: string };
  onholdAllowed?: string | boolean;
  status: {
    success: boolean;
    httpStatus?: number;
  };
}
