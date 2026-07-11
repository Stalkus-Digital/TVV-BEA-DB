/**
 * TripJack Hotel Review Request — POST /hms/v3/hotel/review
 * Source: TripJack Hotels API v3.0
 */

export interface TripJackHotelReviewRequestDTO {
  correlationId: string;
  optionId: string;
  reviewHash: string;
  hid: string;
}
