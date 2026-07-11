/**
 * TripJack Booking Response — POST /oms/v1/air/book
 * Source: TripJack Flights API v2.0.2
 *
 * Also used for Confirm-Book response.
 * After a successful book, call Booking Details (/oms/v1/booking-details)
 * after 5 seconds to get PNR and ticket numbers.
 */
export interface TripJackBookingResponseDTO {
  bookingId: string;
  status: {
    success: boolean;
    httpStatus: number;
  };
}

/**
 * TripJack Booking Details Response — POST /oms/v1/booking-details
 */
export interface TripJackOrderStatusDTO {
  bookingId: string;
  amount: number;
  status: "SUCCESS" | "ON_HOLD" | "CANCELLED" | "FAILED" | "PENDING" | "ABORTED" | "UNCONFIRMED";
  orderNote?: string;
}

export interface TripJackTravellerDetailsDTO {
  pnrDetails?: Record<string, string>;   // Key: "DEP-ARR" → Value: Airline PNR
  gdsPnrs?: Record<string, string>;
  ticketNumberDetails?: Record<string, string>; // Key: "DEP-ARR" → Value: Ticket number
  statusMap?: Record<string, "CANCELLED" | "VOIDED" | "REISSUED" | "NO_SHOW">;
}

export interface TripJackBookingDetailsResponseDTO {
  order: TripJackOrderStatusDTO;
  travellerInfos: TripJackTravellerDetailsDTO[];
  totalPriceInfo?: {
    fc: {
      TF: number;   // Total fare charged
      SSRP?: number; // SSR price (seat + meal + baggage)
    };
  };
  status: {
    success: boolean;
    httpStatus: number;
  };
}
