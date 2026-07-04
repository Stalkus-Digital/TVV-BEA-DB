export interface TripJackSsrOptionDTO {
  code: string;
  description: string;
  price?: number;
}

export interface TripJackSsrResponseDTO {
  options: TripJackSsrOptionDTO[];
}
