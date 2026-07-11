/**
 * TripJack Ancillary SSR DTOs — Seat, Meal, Baggage (post-booking)
 * Source: TripJack Flights API v2.0.2
 *
 * Flow (booking must be in SUCCESS state):
 *  1. Fetch SSR:    POST /fms/v1/ancillaries/fetch/ssr
 *  2. Fetch Seat:   POST /fms/v1/ancillaries/fetch/seat   (optional)
 *  3. Add SSR:      POST /oms/v1/air/amendment/add/ssr
 *  4. Poll Status:  POST /oms/v1/air/amendment/amendment-details
 *
 * Constraints:
 *  - Infants cannot add SSR
 *  - Meals: once per pax per segment
 *  - Baggage: per-trip, can add multiple times (one at a time)
 *  - Seats: once per pax per segment
 */

/** POST /fms/v1/ancillaries/fetch/ssr and /fms/v1/ancillaries/fetch/seat */
export interface TripJackFetchAncillaryRequestDTO {
  bookingId: string;
}

export interface TripJackSsrItemDTO {
  code: string;    // SSR code — pass to Add SSR
  amount?: number; // Charge amount (absent for connecting baggage segments)
  desc: string;    // Customer-facing description
}

export interface TripJackPassengerSsrInfoDTO {
  ssrBaggageInfos: TripJackSsrItemDTO[]; // Already selected baggage
  ssrMealInfos: TripJackSsrItemDTO[];    // Already selected meals
  ssrInfo: {
    BAGGAGE?: TripJackSsrItemDTO[];
    MEAL?: TripJackSsrItemDTO[];
  };
  ti: string;   // Title
  pt: string;   // Pax type
  fN: string;   // First name
  lN: string;   // Last name
}

export interface TripJackFetchSsrResponseDTO {
  tripInfos: {
    sI: {
      id: string; // Segment ID — use as key in Add SSR
      bI: {
        tI: TripJackPassengerSsrInfoDTO[];
      };
    }[];
  }[];
  bookingId: string;
  status: { success: boolean; httpStatus: number };
  conditions: { st: number; sct: string };
}

/** POST /oms/v1/air/amendment/add/ssr */
export interface TripJackAddSsrRequestDTO {
  bookingId: string;
  paymentInfos: { amount: number }[];
  sI: {
    id: string; // Segment ID from Fetch SSR response
    bI: {
      tI: {
        id: number;    // Pax ID from Fetch SSR response
        sbi?: { code: string; amount?: number }; // Baggage — set amount=0 on subsequent segments of same journey
        smi?: { code: string }; // Meal
        ssi?: { code: string }; // Seat
      }[];
    };
  }[];
}

export interface TripJackAddSsrResponseDTO {
  bookingId: string;
  amendmentIds: string[]; // One per trip — use to poll amendment-details
  status: { success: boolean; httpStatus: number };
}
