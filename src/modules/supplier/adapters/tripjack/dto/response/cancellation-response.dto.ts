export interface TripJackCancellationResponseDTO {
  bookingReference: string;
  cancelled: boolean;
  refundAmount?: number;
}
