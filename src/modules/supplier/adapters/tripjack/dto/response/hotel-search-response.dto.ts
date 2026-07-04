export interface TripJackHotelSearchResultDTO {
  hotelId: string;
  traceId: string;
  name: string;
  starRating: number;
  address: string;
  nightlyRate: number;
  currency: string;
}

export interface TripJackHotelSearchResponseDTO {
  results: TripJackHotelSearchResultDTO[];
}
