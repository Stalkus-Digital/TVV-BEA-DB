/** SSR = Special Service Request (meal preference, wheelchair, extra baggage, etc.). */
export interface TripJackSsrRequestDTO {
  resultIndex: string;
  traceId: string;
  paxId: string;
}
