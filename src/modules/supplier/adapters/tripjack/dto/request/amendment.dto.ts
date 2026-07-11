/**
 * TripJack Amendment DTOs — Cancellation, Void, Full Refund
 * Source: TripJack Flights API v2.0.2
 *
 * Three-step flow:
 *  1. GET CHARGES (optional): POST /oms/v1/air/amendment/amendment-charges
 *  2. SUBMIT:                 POST /oms/v1/air/amendment/submit-amendment
 *  3. POLL STATUS:            POST /oms/v1/air/amendment/amendment-details
 *
 * amendmentStatus polling: if REQUESTED, poll 4–5× with 10-second intervals.
 */

export interface TripJackAmendmentTripDTO {
  src?: string;          // Departure airport code (for specific trip)
  dest?: string;         // Arrival airport code
  departureDate?: string; // YYYY-MM-DD
  travellers?: {
    fn: string; // First name (for specific pax)
    ln: string; // Last name
  }[];
}

/** POST /oms/v1/air/amendment/amendment-charges */
export interface TripJackAmendmentChargesRequestDTO {
  bookingId: string;
  type: "CANCELLATION" | "VOIDED" | string;
  remarks: string;
  trips?: TripJackAmendmentTripDTO[];
}

/** POST /oms/v1/air/amendment/submit-amendment */
export interface TripJackSubmitAmendmentRequestDTO {
  bookingId: string;
  type: "CANCELLATION" | "VOIDED" | "FULL_REFUND" | string;
  remarks: string; // For DGCA: use exact string "Refund under DGCA policy"
  trips?: TripJackAmendmentTripDTO[];
}

/** POST /oms/v1/air/amendment/amendment-details */
export interface TripJackAmendmentDetailsRequestDTO {
  amendmentId: string;
}

export interface TripJackAmendmentDetailsResponseDTO {
  bookingId: string;
  amendmentId: string;
  amendmentStatus: "REQUESTED" | "SUCCESS" | "REJECTED" | "PENDING";
  amendmentCharges?: number;
  refundableAmount?: number;
  totalFare?: number;
  trips?: {
    src: string;
    dest: string;
    departureDate: string;
    travellers: {
      fn: string;
      ln: string;
      amendmentCharges?: number;
      refundAmount?: number;
      totalFare?: number;
    }[];
  }[];
}

/** POST /oms/v1/air/amendment/submit-amendment with type FULL_REFUND */
export interface TripJackFullRefundRequestDTO {
  bookingId: string;
  type: "FULL_REFUND";
  remarks: string;
  trips?: TripJackAmendmentTripDTO[];
}
