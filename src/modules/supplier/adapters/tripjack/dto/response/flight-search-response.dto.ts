/**
 * TripJack Flight Search Response — POST /fms/v1/air-search-all
 * Source: TripJack Flights API v2.0.2 official documentation
 *
 * Response structure varies by journey type:
 *  - Domestic/International Oneway:  searchResult.tripInfos.ONWARD
 *  - Domestic Return:                searchResult.tripInfos.ONWARD + .RETURN (2 priceIds needed at Review)
 *  - International Return/Multi-City: searchResult.tripInfos.COMBO  (1 priceId at Review)
 *  - Domestic Multi-City:            Indexed keys per route (N priceIds, max 6)
 */

export interface TripJackFareDetailDTO {
  fC: {
    BF: number;   // Base Fare per pax
    TAF: number;  // Taxes and Fees
    TF: number;   // Total Fare (charged to agent) — use this for paymentInfos.amount in Book
    NCM?: number; // Net Commission (Gross - TDS)
  };
  rT: 0 | 1 | 2; // Refundable: 0=Non-refundable, 1=Refundable, 2=Partial
  bI?: {
    iB?: string; // Check-in baggage allowance e.g. "15 Kg"
    cB?: string; // Cabin baggage allowance e.g. "7 Kg"
  };
  sR?: number;  // Seats remaining
  cc?: string;  // Cabin class code
}

export interface TripJackPriceDTO {
  id: string;                        // Price ID — pass to Review (valid 15 min)
  fareIdentifier: "PUBLISHED" | "SPECIAL_RETURN" | "TJ_FLEX" | string;
  fD: Record<string, TripJackFareDetailDTO>; // Key = pax type: "ADULT" | "CHILD" | "INFANT"
  sri?: string;  // Special Return Identifier (onward)
  msri?: string; // Special Return Identifier (return — must contain onward sri)
}

export interface TripJackSegmentInfoDTO {
  id: string;
  fD: {
    aI: { code: string; name: string; isLcc?: boolean };
    fN: string;  // Flight number
    eT?: string; // Equipment type / aircraft
  };
  duration: number; // minutes
  da: { code: string; name: string; cityCode: string; city: string; country: string; countryCode: string; terminal?: string };
  aa: { code: string; name: string; cityCode: string; city: string; country: string; countryCode: string; terminal?: string };
  dt: string; // Departure datetime ISO
  at: string; // Arrival datetime ISO
  bI?: { iB?: string; cB?: string };
  ssrInfo?: Record<string, unknown>;
}

export interface TripJackTripInfoDTO {
  sI: TripJackSegmentInfoDTO[];
  totalPriceList: TripJackPriceDTO[];
}

export interface TripJackFlightSearchResponseDTO {
  searchResult: {
    tripInfos: {
      ONWARD?: TripJackTripInfoDTO[];
      RETURN?: TripJackTripInfoDTO[];
      COMBO?: TripJackTripInfoDTO[];
      [key: string]: TripJackTripInfoDTO[] | undefined; // Multi-city indexed keys
    };
  };
  status: {
    success: boolean;
    httpStatus: number;
  };
}
