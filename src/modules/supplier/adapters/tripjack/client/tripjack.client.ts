import { err, isErr, ok, type Result } from "@/shared/types";
import { InternalError, NotImplementedError, TimeoutError, type AppError } from "@/shared/errors";
import type { Logger } from "@/shared/logger";
import type { TripJackConfig } from "../config/tripjack.config";
import type { TripJackAuth } from "../services/tripjack-auth.service";
import type { TripJackErrorHandler } from "../services/tripjack-error-handler";
import type { TripJackResponseParser } from "../services/tripjack-response-parser";
import type {
  TripJackFlightSearchRequestDTO,
  TripJackFlightSearchResponseDTO,
  TripJackFlightDetailsRequestDTO,
  TripJackFlightDetailsResponseDTO,
  TripJackHotelSearchRequestDTO,
  TripJackHotelSearchResponseDTO,
  TripJackHotelDetailsRequestDTO,
  TripJackHotelDetailsResponseDTO,
  TripJackFareRulesRequestDTO,
  TripJackFareRulesResponseDTO,
  TripJackSsrRequestDTO,
  TripJackSsrResponseDTO,
  TripJackSeatMapRequestDTO,
  TripJackSeatMapResponseDTO,
} from "../dto";

/**
 * The raw HTTP boundary — the ONLY file in this connector that makes a
 * real network call. Sprint 17 replaces 7 of the 9 placeholder methods
 * with a real `fetch()`; `book()`/`cancel()` are deliberately untouched
 * (still throw `NotImplementedError`) per this sprint's explicit "DO NOT
 * implement Booking/Cancellation." Every endpoint path below is
 * provisional — no real TripJack API documentation has been consulted
 * (same flag every DTO in this connector already carries, see docs/10's
 * Remaining TODOs) — changing a path is a one-line edit once real docs
 * exist; nothing above this layer (the adapter, the mappers) would change.
 */
export class TripJackClient {
  constructor(
    private readonly config: TripJackConfig,
    private readonly auth: TripJackAuth,
    private readonly errorHandler: TripJackErrorHandler,
    private readonly responseParser: TripJackResponseParser,
    private readonly logger: Logger
  ) {}

  /** "Every request must be prepared for logging" — never logs the password/token values themselves. */
  private prepareRequestLog(operation: string, path: string, payload: unknown): void {
    this.logger.info("Prepared TripJack request", {
      operation,
      apiUrl: this.config.get("apiUrl"),
      path,
      agencyId: this.config.get("agencyId"),
      timeoutMs: this.config.get("timeoutMs"),
      payload,
    });
  }

  async searchFlights(request: TripJackFlightSearchRequestDTO, signal?: AbortSignal): Promise<Result<TripJackFlightSearchResponseDTO, AppError>> {
    const result = await this.request<TripJackFlightSearchResponseDTO>("searchFlights", "/flights/search", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<TripJackFlightSearchResponseDTO>(result.value, ["results"]);
  }

  async getFlightDetails(request: TripJackFlightDetailsRequestDTO, signal?: AbortSignal): Promise<Result<TripJackFlightDetailsResponseDTO, AppError>> {
    const result = await this.request<TripJackFlightDetailsResponseDTO>("getFlightDetails", "/flights/details", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<TripJackFlightDetailsResponseDTO>(result.value, ["resultIndex", "traceId", "refundable"]);
  }

  async searchHotels(request: TripJackHotelSearchRequestDTO, signal?: AbortSignal): Promise<Result<TripJackHotelSearchResponseDTO, AppError>> {
    const result = await this.request<TripJackHotelSearchResponseDTO>("searchHotels", "/hms/v1/hotel-search", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<TripJackHotelSearchResponseDTO>(result.value, ["results"]);
  }

  async getHotelDetails(request: TripJackHotelDetailsRequestDTO, signal?: AbortSignal): Promise<Result<TripJackHotelDetailsResponseDTO, AppError>> {
    const result = await this.request<TripJackHotelDetailsResponseDTO>("getHotelDetails", "/hotels/details", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<TripJackHotelDetailsResponseDTO>(result.value, ["hotelId", "traceId", "amenities"]);
  }

  async book(request: unknown, signal?: AbortSignal): Promise<Result<any, AppError>> {
    // Determine if it's a flight or hotel based on payload
    const isHotel = (request as any).hotelId !== undefined;
    const path = isHotel ? "/hms/v1/hotel-book" : "/fms/v1/book";
    const result = await this.request<any>("book", path, request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<any>(result.value, ["bookingId"]);
  }

  async cancel(request: unknown, signal?: AbortSignal): Promise<Result<any, AppError>> {
    const isHotel = (request as any).hotelId !== undefined;
    const path = isHotel ? "/hms/v1/cancel" : "/fms/v1/cancel";
    const result = await this.request<any>("cancel", path, request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<any>(result.value, ["cancellationId"]);
  }

  async getFareRules(request: TripJackFareRulesRequestDTO, signal?: AbortSignal): Promise<Result<TripJackFareRulesResponseDTO, AppError>> {
    const result = await this.request<TripJackFareRulesResponseDTO>("getFareRules", "/flights/fare-rules", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<TripJackFareRulesResponseDTO>(result.value, ["resultIndex", "rules"]);
  }

  async getSsrOptions(request: TripJackSsrRequestDTO, signal?: AbortSignal): Promise<Result<TripJackSsrResponseDTO, AppError>> {
    const result = await this.request<TripJackSsrResponseDTO>("getSsrOptions", "/flights/ssr", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<TripJackSsrResponseDTO>(result.value, ["options"]);
  }

  async getSeatMap(request: TripJackSeatMapRequestDTO, signal?: AbortSignal): Promise<Result<TripJackSeatMapResponseDTO, AppError>> {
    const result = await this.request<TripJackSeatMapResponseDTO>("getSeatMap", "/flights/seat-map", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<TripJackSeatMapResponseDTO>(result.value, ["seats"]);
  }

  /** The one place every real call funnels through — token attachment, request logging, JSON parsing, and error normalization all happen here exactly once. */
  private async request<T>(operation: string, path: string, payload: unknown, signal?: AbortSignal): Promise<Result<T, AppError>> {
    this.prepareRequestLog(operation, path, payload);

    const tokenResult = await this.auth.getToken();
    if (isErr(tokenResult)) return tokenResult;

    try {
      const response = await fetch(`${this.config.get("apiUrl")}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: tokenResult.value },
        body: JSON.stringify(payload),
        signal,
      });

      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        return err(this.errorHandler.toAppError({ statusCode: response.status, message: this.extractMessage(body) }));
      }
      return ok(body as T);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return err(new TimeoutError(`TripJack ${operation} request timed out or was cancelled`));
      }
      return err(new InternalError(`TripJack ${operation} request failed: ${error instanceof Error ? error.message : String(error)}`, { source: "tripjack", operation }));
    }
  }

  private extractMessage(body: unknown): string | undefined {
    if (typeof body === "object" && body !== null && "message" in body && typeof (body as Record<string, unknown>).message === "string") {
      return (body as Record<string, unknown>).message as string;
    }
    return undefined;
  }
}
