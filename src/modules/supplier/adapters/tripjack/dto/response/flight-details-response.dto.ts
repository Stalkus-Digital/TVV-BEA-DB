import type { TripJackSegmentInfoDTO } from "./flight-search-response.dto";

/**
 * TripJack Flight Details / Review Response
 * Used for both getFlightDetails and reviewFlight.
 * The full trip segment info is the base, plus detail-specific fields.
 */
export interface TripJackFlightDetailsResponseDTO {
  resultIndex?: string;
  traceId?: string;
  bookingId?: string;
  sI?: TripJackSegmentInfoDTO[];
  baggageAllowance?: string;
  refundable?: boolean;
  conditions?: Record<string, unknown>;
  tripInfos?: Record<string, unknown>;
  status?: { success: boolean; httpStatus: number };
}
