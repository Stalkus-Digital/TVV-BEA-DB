export interface TripJackHotelSearchRequestDTO {
  cityCode: string;
  checkIn: string;
  checkOut: string;
  rooms: { adults: number; children?: number }[];
}
