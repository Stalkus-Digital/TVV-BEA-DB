/**
 * TripJack Review Request — POST /fms/v1/review
 * Source: TripJack Flights API v2.0.2
 *
 * Step 3 in the booking funnel. REQUIRED before Book.
 * Revalidates selected price IDs and returns a session bookingId.
 *
 * priceIds to send:
 *  - Oneway:                  1 priceId (ONWARD)
 *  - Domestic Return:         2 priceIds (ONWARD + RETURN)
 *  - International Return/MC: 1 priceId (COMBO)
 *  - Domestic Multi-City:     N priceIds (one per leg)
 */
export interface TripJackReviewRequestDTO {
  priceIds: string[]; // Price IDs from Search response (valid 15 min)
}

/**
 * TripJack Review Response — POST /fms/v1/review
 */
export interface TripJackReviewConditionsDTO {
  st: number;     // Session time in seconds — bookingId valid this long
  sct: string;    // Session created timestamp
  isa: boolean;   // Seat Applicable — call Seat Map API only if true
  isBA?: boolean; // Hold (block) allowed for this fare
  iecr?: boolean; // Emergency contact details mandatory in Book request
  igm?: boolean;  // GST mandatory (gstInfo.gstNumber required in Book)
  gstappl?: boolean; // GST optional but applicable
  pm?: boolean;   // Passport mandatory
  pped?: boolean; // Passport expiry date required
  adobr?: boolean; // DOB required for adults
  cdobr?: boolean; // DOB required for children
  idobr?: boolean; // DOB required for infants
  ipa?: boolean;  // PAN card applicable
  ida?: boolean;  // Document ID applicable (student/senior)
  idm?: boolean;  // Document ID mandatory
}

export interface TripJackReviewAlertDTO {
  type: "FAREALERT" | string;
  message?: string;
}

export interface TripJackReviewResponseDTO {
  bookingId: string; // Session booking ID — pass to all subsequent calls
  conditions: TripJackReviewConditionsDTO;
  tripInfos: Record<string, unknown>; // Full trip itinerary (segments, prices, SSR options if available)
  alerts?: TripJackReviewAlertDTO[];  // FAREALERT = price changed from search — inform customer
  status: {
    success: boolean;
    httpStatus: number;
  };
}
