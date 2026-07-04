export interface TripJackSeatDTO {
  seatNumber: string;
  available: boolean;
  price?: number;
}

export interface TripJackSeatMapResponseDTO {
  seats: TripJackSeatDTO[];
}
