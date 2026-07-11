/**
 * TripJack Hotel Common Option Object v3.0
 * Used in Listing, Dynamic Detail, and Review.
 */
export interface TripJackHotelOptionDTO {
  optionId: string;
  optionType: "SRSM" | "SRCM" | "CRSM" | "CRCM";
  roomInfo: {
    id: string;
    name: string;
  }[];
  inclusions: string[];
  mealBasis: string;
  bookingNotes?: string;
  pricing: {
    totalPrice: number;
    basePrice: number;
    discount: number;
    taxes: number;
    mf: number;
    mft: number;
    currency: string;
    strikethrough?: number;
  };
  commercial: {
    type: "NET" | "COMMISSIONABLE" | "EXTRANET";
    commission: number;
  };
  compliance: {
    gstType: string;
    panRequired: boolean;
    passportRequired: boolean;
  };
  cancellation: {
    isRefundable: boolean;
    penalties: {
      from: string;
      to: string;
      amount: number;
    }[];
  };
}

/**
 * TripJack Hotel Listing Response — POST /hms/v3/hotel/listing
 */
export interface TripJackHotelListingResultDTO {
  tjHotelId: string;
  name: string;
  options: TripJackHotelOptionDTO[];
}

export interface TripJackHotelSearchResponseDTO {
  correlationId?: string;
  nationality?: string;
  currency?: string;
  totalResults: number;
  hotels: TripJackHotelListingResultDTO[];
  status: {
    success: boolean;
    httpStatus?: number;
  };
}
