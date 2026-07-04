export interface TripJackBookingPassengerDTO {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  passportNumber?: string;
}

export interface TripJackBookingRequestDTO {
  resultIndex: string;
  traceId: string;
  passengers: TripJackBookingPassengerDTO[];
  contactEmail: string;
  contactPhone: string;
}
