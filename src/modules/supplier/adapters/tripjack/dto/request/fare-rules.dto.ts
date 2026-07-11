/**
 * TripJack Fare Rule Request — POST /fms/v2/farerule
 * Source: TripJack Flights API v2.0.2
 *
 * Can be called at three stages:
 *  - After Search:   flowType = "SEARCH",         id = priceId
 *  - After Review:   flowType = "REVIEW",          id = bookingId
 *  - After Booking:  flowType = "BOOKING_DETAIL",  id = bookingId
 */
export interface TripJackFareRulesRequestDTO {
  flowType: "SEARCH" | "REVIEW" | "BOOKING_DETAIL";
  id: string; // priceId (from Search) or bookingId (from Review/Booking)
}
