/**
 * TripJack Hotel Detail Dynamic Request — POST /hms/v3/hotel/pricing
 * Source: TripJack Hotels API v3.0
 */

export interface TripJackHotelDetailsRequestDTO {
  correlationId?: string;
  hid: string; // TripJack hotel identifier (tjHotelId)
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  rooms: {
    adults: number;
    children?: number;
    childAge?: number[]; // Required if children > 0
  }[];
  currency: string;
  nationality: string;
  timeoutMs?: number;
}
