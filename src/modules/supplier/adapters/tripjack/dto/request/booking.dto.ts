/**
 * TripJack Booking Request — POST /oms/v1/air/book
 * Source: TripJack Flights API v2.0.2
 *
 * Supports four modes:
 *  1. Instant Book:          Include paymentInfos.amount = TF from Review
 *  2. Hold (no payment):     Omit paymentInfos; only when conditions.isBA = true
 *  3. Confirm Fare:          POST /oms/v1/air/fare-validate (same structure)
 *  4. Confirm-Book (hold→ticket): POST /oms/v1/air/confirm-book
 *
 * ⚠️  paymentInfos.amount MUST equal TF (Total Fare) from AirReviewResponse.
 *     TripJack determines payment medium internally — do NOT include type.
 */

export interface TripJackSsrCodeDTO {
  key: string;  // Segment key from Review tripInfos
  code: string; // SSR code selected by customer
}

export interface TripJackTravellerInfoDTO {
  ti: string;   // Title: Adult = "Mr" | "Mrs" | "Ms", Child/Infant = "Ms" | "Master"
  pt: "ADULT" | "CHILD" | "INFANT";
  fN: string;   // First name
  lN: string;   // Last name
  dob?: string; // YYYY-MM-DD — mandatory for INFANT, check dob conditions from Review
  pNum?: string; // Passport number (when conditions.pm = true)
  eD?: string;  // Passport expiry date YYYY-MM-DD (when conditions.pped = true)
  pNat?: string; // Passport nationality — 2-letter IATA country code
  pid?: string;  // Passport issue date YYYY-MM-DD
  pan?: string;  // PAN card number (when conditions.ipa = true)
  di?: string;   // Document ID for student/senior citizen fares
  ssrBaggageInfos?: TripJackSsrCodeDTO[];
  ssrMealInfos?: TripJackSsrCodeDTO[];
  ssrSeatInfos?: TripJackSsrCodeDTO[];
  ssrExtraServiceInfos?: TripJackSsrCodeDTO[];
  ff?: Record<string, string>; // Frequent flyer: { "AI": "23422" }
}

export interface TripJackGstInfoDTO {
  gstNumber: string;       // 15-digit GST number (mandatory when conditions.igm = true)
  registeredName: string;  // max 35 chars IATA standard
  email: string;
  mobile: string;
  address: string;         // max 70 chars IATA standard
}

export interface TripJackBookingRequestDTO {
  bookingId: string;            // From Review response — required
  paymentInfos?: { amount: number }[]; // Omit for Hold booking
  deliveryInfo: {
    emails: string[];           // Booking confirmation email addresses
    contacts: string[];         // Contact numbers with country code e.g. "+919500112233"
  };
  contactInfo?: {               // Required when conditions.iecr = true
    emails?: string[];
    contacts?: string[];
    ecn?: string;               // Emergency contact name
  };
  travellerInfo: TripJackTravellerInfoDTO[];
  gstInfo?: TripJackGstInfoDTO; // Required when conditions.igm = true
}

/**
 * Used for Confirm-Book (hold to ticket): POST /oms/v1/air/confirm-book
 * Same as BookingRequest but always includes paymentInfos.
 */
export type TripJackConfirmBookRequestDTO = TripJackBookingRequestDTO & {
  paymentInfos: { amount: number }[];
};
