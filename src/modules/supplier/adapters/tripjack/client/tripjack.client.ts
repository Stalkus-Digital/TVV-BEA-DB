import { err, isErr, ok, type Result } from "@/shared/types";
import { InternalError, TimeoutError, type AppError } from "@/shared/errors";
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
  TripJackHotelReviewRequestDTO,
  TripJackHotelReviewResponseDTO,
  TripJackHotelStaticDetailRequestDTO,
  TripJackHotelStaticDetailResponseDTO,
  TripJackFareRulesRequestDTO,
  TripJackFareRulesResponseDTO,
  TripJackSsrRequestDTO,
  TripJackSsrResponseDTO,
  TripJackSeatMapRequestDTO,
  TripJackSeatMapResponseDTO,
} from "../dto";

/**
 * The raw HTTP boundary — the ONLY file in this connector that makes a
 * real network call. All paths are sourced directly from TripJack's
 * official Flights API v2.0.2 documentation (provided 2026-07-11).
 *
 * UAT Base:  apitest.tripjack.com
 * Prod Base: tripjack.com
 *
 * ── Pre-booking (FMS) ──────────────────────────────────────────────────
 *   Search          POST /fms/v1/air-search-all
 *   Fare Rule v2    POST /fms/v2/farerule
 *   Review          POST /fms/v1/review          ← required before booking
 *   Seat Map        POST /fms/v1/seat
 *
 * ── Booking (OMS) ──────────────────────────────────────────────────────
 *   Fare Validate   POST /oms/v1/air/book/fare-validate
 *   Book            POST /oms/v1/air/book
 *   Confirm Fare    POST /oms/v1/air/fare-validate
 *   Confirm-Book    POST /oms/v1/air/confirm-book
 *   Booking Details POST /oms/v1/booking-details
 *   Release PNR     POST /oms/v1/air/unhold
 *
 * ── Hotels (HMS) ───────────────────────────────────────────────────────
 *   Hotel Search    POST /hms/v1/hotel-search
 *   Hotel Details   POST /hms/v1/hotel-detail
 *   Hotel Book      POST /hms/v1/hotel-book
 *
 * Authentication: all requests send the API key as the `apikey` request
 * header (NOT Authorization Bearer). No session token exchange is needed
 * when TRIPJACK_TOKEN is set — that value IS the API key.
 *
 * ⚠️  Endpoints must NOT have a trailing slash (TripJack returns an error).
 */
export class TripJackClient {
  constructor(
    private readonly config: TripJackConfig,
    private readonly auth: TripJackAuth,
    private readonly errorHandler: TripJackErrorHandler,
    private readonly responseParser: TripJackResponseParser,
    private readonly logger: Logger
  ) {}

  /** Logs the outbound request — never logs the API key value itself. */
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

  // ── Pre-booking: FMS ──────────────────────────────────────────────────

  /**
   * Step 1 of booking funnel.
   * Official path: POST /fms/v1/air-search-all
   * Results are cached for 5 minutes (flight prices change, avoid stale data
   * beyond that). Cache key includes the full request so different searches
   * get different cache entries.
   */
  async searchFlights(request: TripJackFlightSearchRequestDTO, signal?: AbortSignal): Promise<Result<TripJackFlightSearchResponseDTO, AppError>> {
    const cacheKey = `tripjack:flight-search:${JSON.stringify(request)}`;
    try {
      const { redis } = await import("@/shared/lib/redis");
      const cached = await redis?.get(cacheKey);
      if (cached) return ok(JSON.parse(cached));
    } catch(e) {}

    const result = await this.request<TripJackFlightSearchResponseDTO>("searchFlights", "/fms/v1/air-search-all", request, signal);
    if (isErr(result)) return result;

    // Real response key: searchResult (not "results")
    const parsed = this.responseParser.parse<TripJackFlightSearchResponseDTO>(result.value, ["searchResult"]);
    if (!isErr(parsed)) {
      try {
        const { redis } = await import("@/shared/lib/redis");
        await redis?.setex(cacheKey, 300, JSON.stringify(parsed.value));
      } catch(e) {}
    }
    return parsed;
  }

  /**
   * Flight detail lookup — used internally by `details()` in the adapter.
   * No direct equivalent in the official docs as a standalone "details" call;
   * the real pre-booking detail step is `reviewFlight()` below.
   * This method hits the same search-result metadata when a resultIndex is known.
   */
  async getFlightDetails(request: TripJackFlightDetailsRequestDTO, signal?: AbortSignal): Promise<Result<TripJackFlightDetailsResponseDTO, AppError>> {
    // Review is the official pre-booking detail call in TripJack v2.0
    const result = await this.request<TripJackFlightDetailsResponseDTO>("getFlightDetails", "/fms/v1/review", request, signal);
    if (isErr(result)) return result;
    // Review response key: bookingId or status
    return this.responseParser.parse<TripJackFlightDetailsResponseDTO>(result.value, ["status"]);
  }

  /**
   * Step 2 of booking funnel — REQUIRED before booking.
   * Returns current price, availability confirmation, and fare breakdown.
   * Official path: POST /fms/v1/review
   */
  async reviewFlight(request: { resultIndex: string; traceId: string }, signal?: AbortSignal): Promise<Result<any, AppError>> {
    const result = await this.request<any>("reviewFlight", "/fms/v1/review", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<any>(result.value, ["resultIndex"]);
  }

  /**
   * Fare Rule lookup (v2).
   * Official path: POST /fms/v2/farerule
   * Note: v2 path — intentional, not a typo.
   */
  async getFareRules(request: TripJackFareRulesRequestDTO, signal?: AbortSignal): Promise<Result<TripJackFareRulesResponseDTO, AppError>> {
    const result = await this.request<TripJackFareRulesResponseDTO>("getFareRules", "/fms/v2/farerule", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<TripJackFareRulesResponseDTO>(result.value, ["resultIndex", "rules"]);
  }

  /**
   * Seat map for a specific flight.
   * Official path: POST /fms/v1/seat
   * (Not /fms/v1/seat-map — that path does not exist in TripJack v2.0)
   */
  async getSeatMap(request: TripJackSeatMapRequestDTO, signal?: AbortSignal): Promise<Result<TripJackSeatMapResponseDTO, AppError>> {
    const result = await this.request<TripJackSeatMapResponseDTO>("getSeatMap", "/fms/v1/seat", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<TripJackSeatMapResponseDTO>(result.value, ["seats"]);
  }

  /**
   * SSR (Special Service Requests) — meal, wheelchair, etc.
   * Not listed in the official v2.0.2 reference table.
   * Keeping the path as-is; confirm with TripJack support during UAT.
   */
  async getSsrOptions(request: TripJackSsrRequestDTO, signal?: AbortSignal): Promise<Result<TripJackSsrResponseDTO, AppError>> {
    const result = await this.request<TripJackSsrResponseDTO>("getSsrOptions", "/fms/v1/ssr", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<TripJackSsrResponseDTO>(result.value, ["options"]);
  }

  // ── Hotels: HMS ───────────────────────────────────────────────────────

  /**
   * Hotel Listing (Search) — v3.0
   * Official path: POST /hms/v3/hotel/listing
   */
  async searchHotels(request: TripJackHotelSearchRequestDTO, signal?: AbortSignal): Promise<Result<TripJackHotelSearchResponseDTO, AppError>> {
    const result = await this.request<TripJackHotelSearchResponseDTO>("searchHotels", "/hms/v3/hotel/listing", request, signal);
    if (isErr(result)) return result;
    // v3 response structure uses "hotels" instead of "results"
    return this.responseParser.parse<TripJackHotelSearchResponseDTO>(result.value, ["hotels"]);
  }

  /**
   * Hotel Dynamic Detail (Pricing) — v3.0
   * Official path: POST /hms/v3/hotel/pricing
   */
  async getHotelDetails(request: TripJackHotelDetailsRequestDTO, signal?: AbortSignal): Promise<Result<TripJackHotelDetailsResponseDTO, AppError>> {
    const result = await this.request<TripJackHotelDetailsResponseDTO>("getHotelDetails", "/hms/v3/hotel/pricing", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<TripJackHotelDetailsResponseDTO>(result.value, ["tjHotelId", "options", "reviewHash"]);
  }

  /**
   * Hotel Review (Pre-booking) — v3.0
   * Official path: POST /hms/v3/hotel/review
   */
  async reviewHotel(request: TripJackHotelReviewRequestDTO, signal?: AbortSignal): Promise<Result<TripJackHotelReviewResponseDTO, AppError>> {
    const result = await this.request<TripJackHotelReviewResponseDTO>("reviewHotel", "/hms/v3/hotel/review", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<TripJackHotelReviewResponseDTO>(result.value, ["bookingId", "option"]);
  }

  /**
   * Hotel Static Detail — v3.0
   * Official path: POST /hms/v3/hotel/static-detail
   */
  async getHotelStaticDetails(request: TripJackHotelStaticDetailRequestDTO, signal?: AbortSignal): Promise<Result<TripJackHotelStaticDetailResponseDTO, AppError>> {
    const result = await this.request<TripJackHotelStaticDetailResponseDTO>("getHotelStaticDetails", "/hms/v3/hotel/static-detail", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<TripJackHotelStaticDetailResponseDTO>(result.value, ["tjHotelId"]);
  }

  // ── Booking & Post-booking: OMS ───────────────────────────────────────

  /**
   * Books a flight or hotel.
   *
   * Flight:  POST /oms/v1/air/book
   * Hotel:   POST /oms/v3/hotel/book
   *
   * For Instant booking: send once and ticket is issued.
   * For Hold booking: send with hold flag, then confirm via /oms/v1/air/confirm-book or /oms/v3/hotel/confirm-book.
   *
   * ⚠️  Call reviewFlight() or reviewHotel() first — TripJack will reject bookings
   *     where fare has not been reviewed within the session.
   */
  async book(request: unknown, signal?: AbortSignal): Promise<Result<any, AppError>> {
    const isHotel = (request as any).type === "HOTEL" || (request as any).hotelId !== undefined;
    const path = isHotel ? "/oms/v3/hotel/book" : "/oms/v1/air/book";
    const result = await this.request<any>("book", path, request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<any>(result.value, ["bookingId"]);
  }

  /**
   * Validate fare immediately before booking (instant booking flow).
   * Official path: POST /oms/v1/air/book/fare-validate
   */
  async fareValidateBeforeBook(request: unknown, signal?: AbortSignal): Promise<Result<any, AppError>> {
    const result = await this.request<any>("fareValidateBeforeBook", "/oms/v1/air/book/fare-validate", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<any>(result.value, ["status"]);
  }

  /**
   * Confirm fare before final ticket issuance.
   * Official path: POST /oms/v1/air/fare-validate
   */
  async confirmFareBeforeTicket(request: unknown, signal?: AbortSignal): Promise<Result<any, AppError>> {
    const result = await this.request<any>("confirmFareBeforeTicket", "/oms/v1/air/fare-validate", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<any>(result.value, ["status"]);
  }

  /**
   * Confirm a Hold booking (converts hold PNR to confirmed ticket).
   * Official path: POST /oms/v1/air/confirm-book
   */
  async confirmBook(request: unknown, signal?: AbortSignal): Promise<Result<any, AppError>> {
    const result = await this.request<any>("confirmBook", "/oms/v1/air/confirm-book", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<any>(result.value, ["bookingId"]);
  }

  /**
   * Get full booking details including PNR and ticket status.
   * Official path: POST /oms/v1/booking-details
   */
  async getBookingDetails(request: { bookingId: string }, signal?: AbortSignal): Promise<Result<any, AppError>> {
    const result = await this.request<any>("getBookingDetails", "/oms/v1/booking-details", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<any>(result.value, ["bookingId"]);
  }

  /**
   * Cancel / void a booking.
   *
   * For flights (cancel/void): TripJack does not expose a standalone cancel
   * endpoint in v2.0.2 — cancellation goes through the amendment flow
   * (/oms/v1/air/amendment/submit-amendment with type CANCEL) or void
   * before ticketing. Keeping a best-effort path here; confirm with TripJack.
   *
   * Hotel cancellation: POST /hms/v1/cancel (HMS namespace).
   */
  async cancel(request: unknown, signal?: AbortSignal): Promise<Result<any, AppError>> {
    const isHotel = (request as any).hotelId !== undefined;
    // Hotels have a dedicated cancel endpoint; flights use the amendment API for cancellation
    const path = isHotel ? "/hms/v3/hotel/cancel" : "/oms/v1/air/amendment/submit-amendment";
    const result = await this.request<any>("cancel", path, request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<any>(result.value, ["cancellationId"]);
  }

  /**
   * Release a held PNR without completing the booking.
   * Official path: POST /oms/v1/air/unhold
   */
  async releasePnr(request: { bookingId: string }, signal?: AbortSignal): Promise<Result<any, AppError>> {
    const result = await this.request<any>("releasePnr", "/oms/v1/air/unhold", request, signal);
    if (isErr(result)) return result;
    return this.responseParser.parse<any>(result.value, ["status"]);
  }

  // ── Core HTTP ─────────────────────────────────────────────────────────

  /**
   * Single fetch path every method above funnels through.
   * - Attaches the `apikey` header (TripJack's auth model — not Bearer token)
   * - Retries 5xx responses up to 3 times with exponential backoff (1s, 2s)
   * - Maps AbortSignal cancellation to TimeoutError
   * - Never logs the API key value
   */
  private async request<T>(operation: string, path: string, payload: unknown, signal?: AbortSignal): Promise<Result<T, AppError>> {
    this.prepareRequestLog(operation, path, payload);

    const tokenResult = await this.auth.getToken();
    if (isErr(tokenResult)) return tokenResult;

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await fetch(`${this.config.get("apiUrl")}${path}`, {
          method: "POST",
          // TripJack uses `apikey` header — NOT Authorization Bearer
          headers: { "Content-Type": "application/json", apikey: tokenResult.value },
          body: JSON.stringify(payload),
          signal,
        });

        const body: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          if (response.status >= 500 && attempt < maxRetries - 1) {
            attempt++;
            await new Promise(res => setTimeout(res, attempt * 1000));
            continue;
          }
          return err(this.errorHandler.toAppError({ statusCode: response.status, message: this.extractMessage(body) }));
        }
        return ok(body as T);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return err(new TimeoutError(`TripJack ${operation} request timed out or was cancelled`));
        }
        if (attempt < maxRetries - 1) {
          attempt++;
          await new Promise(res => setTimeout(res, attempt * 1000));
          continue;
        }
        return err(new InternalError(`TripJack ${operation} request failed: ${error instanceof Error ? error.message : String(error)}`, { source: "tripjack", operation }));
      }
    }
    return err(new InternalError("Max retries exceeded"));
  }

  private extractMessage(body: unknown): string | undefined {
    if (typeof body === "object" && body !== null && "message" in body && typeof (body as Record<string, unknown>).message === "string") {
      return (body as Record<string, unknown>).message as string;
    }
    return undefined;
  }
}
