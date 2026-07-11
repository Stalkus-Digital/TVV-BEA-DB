/**
 * TripJack Seat Map Request — POST /fms/v1/seat (pre-booking)
 * Source: TripJack Flights API v2.0.2
 *
 * Only call when conditions.isa = true in the Review response.
 * Pass the bookingId obtained from Review.
 *
 * Post-booking seat map (ancillaries): POST /fms/v1/ancillaries/fetch/seat
 * — uses the same request shape.
 */
export interface TripJackSeatMapRequestDTO {
  bookingId: string; // bookingId from Review response
}
