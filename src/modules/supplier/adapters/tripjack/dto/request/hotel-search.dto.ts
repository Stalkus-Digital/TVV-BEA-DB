/**
 * TripJack Hotel Listing Request — POST /hms/v3/hotel/listing
 * Source: TripJack Hotels API v3.0
 */

export interface TripJackHotelSearchRequestDTO {
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  rooms: {
    adults: number;
    children?: number;
    childAge?: number[]; // Required if children > 0
  }[];
  currency: string;
  correlationId?: string;
  nationality: string;
  timeoutMs?: number;
  hids?: number[]; // Array of specific TripJack hotel IDs (tjHotelId) to search. Max 100
}
