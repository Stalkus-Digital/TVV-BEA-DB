export interface TripJackBookingResponseDTO {
  bookingReference: string;
  status: "CONFIRMED" | "PENDING" | "FAILED";
  ticketingDeadline?: string;
}
