import { NotImplementedError, ValidationError, InternalError, type AppError } from "@/shared/errors";
import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseSupplierAdapter, type SupplierAdapterContext } from "../base-supplier.adapter";
import {
  SupplierCapability,
  type SupplierBookingConfirmation,
  type SupplierBookingRequest,
  type SupplierCancellationResult,
  type SupplierHealthStatus,
  type SupplierSearchCriteria,
  type SupplierSearchResult,
} from "../../types";
import { SupplierConfigService } from "../../services/supplier-config.service";
import { TripJackClient } from "./client/tripjack.client";
import { TripJackConfig } from "./config/tripjack.config";
import { TripJackAuth } from "./services/tripjack-auth.service";
import { TripJackErrorHandler } from "./services/tripjack-error-handler";
import { TripJackResponseParser } from "./services/tripjack-response-parser";
import { TripJackHotelMapper } from "./mappers/tripjack-hotel.mapper";
import { TripJackFlightMapper } from "./mappers/tripjack-flight.mapper";
import type { TripJackFlightSearchRequestDTO, TripJackHotelSearchRequestDTO } from "./dto";

export * from "./dto";
export * from "./mappers";
export * from "./types";
export { TripJackClient } from "./client/tripjack.client";
export { TripJackConfig } from "./config/tripjack.config";
export { TripJackAuth } from "./services/tripjack-auth.service";
export { TripJackErrorHandler } from "./services/tripjack-error-handler";
export { TripJackResponseParser } from "./services/tripjack-response-parser";

const HOTEL_REFERENCE_PREFIX = "HOTEL";
const FLIGHT_REFERENCE_PREFIX = "FLIGHT";
const HOTEL_DETAILS_CACHE_TTL_MS = 5 * 60_000;

/** `Supplier.details(referenceId)` takes a single opaque string with no capability hint — this composite-encodes both the TripJack id and traceId a follow-up call needs, prefixed with which capability it belongs to, since `search()`'s results are the only place that id/traceId pair is ever seen together. */
function encodeReference(prefix: string, id: string, traceId: string): string {
  return `${prefix}::${id}::${traceId}`;
}

function decodeReference(referenceId: string): { prefix: string; id: string; traceId: string } | null {
  const parts = referenceId.split("::");
  if (parts.length !== 3) return null;
  const [prefix, id, traceId] = parts;
  return { prefix, id, traceId };
}

/**
 * Composes the full TripJack connector into the one thing the Supplier
 * Engine actually registers: an adapter implementing `Supplier`. Sprint 3's
 * contract (code, name, capabilities) is unchanged — module.ts and
 * adapters/index.ts needed no changes for this sprint either. Sprint 17
 * replaces the placeholder search()/details()/health() with real,
 * working implementations; book()/cancel() are deliberately untouched
 * (still throw `NotImplementedError`, per "DO NOT implement
 * Booking/Cancellation").
 */
export class TripJackAdapter extends BaseSupplierAdapter {
  private readonly tripjackConfig: TripJackConfig;
  private readonly auth: TripJackAuth;
  private readonly errorHandler: TripJackErrorHandler;
  private readonly responseParser: TripJackResponseParser;
  private readonly client: TripJackClient;
  private readonly hotelMapper: TripJackHotelMapper;
  private readonly flightMapper: TripJackFlightMapper;

  constructor(context: SupplierAdapterContext) {
    super("tripjack", "TripJack", context);
    this.tripjackConfig = TripJackConfig.getInstance();
    this.auth = new TripJackAuth(this.tripjackConfig, this.logger);
    this.errorHandler = new TripJackErrorHandler();
    this.responseParser = new TripJackResponseParser();
    this.client = new TripJackClient(this.tripjackConfig, this.auth, this.errorHandler, this.responseParser, this.logger);
    this.hotelMapper = new TripJackHotelMapper();
    this.flightMapper = new TripJackFlightMapper();
  }

  capabilities(): SupplierCapability[] {
    return [SupplierCapability.FLIGHTS, SupplierCapability.HOTELS];
  }

  override async initialize(): Promise<Result<void, AppError>> {
    const enabled = SupplierConfigService.getInstance().get("tripjackEnabled");
    const configured = this.isConfigured();
    this.logger.info("TripJack adapter config read", { enabled, configured });
    return super.initialize();
  }

  /**
   * Reports the four dimensions this sprint asks for — Configured,
   * Authenticated, Reachable, Latency — composed into `message`, since
   * `SupplierHealthStatus` (the Supplier Engine's own frozen port type,
   * not modified this sprint) only has `{healthy, message?, checkedAt}`,
   * with no dedicated fields for any of the four. "Authenticated" and
   * "Reachable" are both proven (or disproven) by the same signal: a real
   * `getToken()` call succeeding is the only honest way to know either is
   * true without a dedicated ping endpoint TripJack's API may not have.
   */
  override async health(): Promise<Result<SupplierHealthStatus, AppError>> {
    const configured = this.isConfigured();
    if (!configured) {
      return ok({ healthy: false, message: "NOT_CONFIGURED", checkedAt: new Date().toISOString() });
    }

    const startedAt = Date.now();
    const tokenResult = await this.auth.getToken();
    const latencyMs = Date.now() - startedAt;

    if (isErr(tokenResult)) {
      return ok({
        healthy: false,
        message: `configured=true authenticated=false reachable=unknown latencyMs=${latencyMs} error="${tokenResult.error.message}"`,
        checkedAt: new Date().toISOString(),
      });
    }

    return ok({
      healthy: true,
      message: `configured=true authenticated=true reachable=true latencyMs=${latencyMs}`,
      checkedAt: new Date().toISOString(),
    });
  }

  override async search(criteria: SupplierSearchCriteria): Promise<Result<SupplierSearchResult[], AppError>> {
    if (criteria.capability === SupplierCapability.HOTELS) {
      const request = this.toHotelSearchRequest(criteria);
      const result = await this.client.searchHotels(request);
      if (isErr(result)) return result;
      return ok(
        result.value.hotels.map((dto) => ({
          referenceId: encodeReference(HOTEL_REFERENCE_PREFIX, dto.tjHotelId, result.value.correlationId ?? "none"),
          ...this.hotelMapper.toInventoryHotel(dto),
        }))
      );
    }

    if (criteria.capability === SupplierCapability.FLIGHTS) {
      const request = this.toFlightSearchRequest(criteria);
      const result = await this.client.searchFlights(request);
      if (isErr(result)) return result;

      // Real TripJack response: searchResult.tripInfos.{ONWARD|RETURN|COMBO|indexed}
      // Each value is an array of trip groups; each group has totalPriceList (priceIds) + sI (segments)
      const tripInfos = result.value.searchResult?.tripInfos ?? {};
      const mappedResults: SupplierSearchResult[] = [];

      for (const tripGroup of Object.values(tripInfos)) {
        if (!Array.isArray(tripGroup)) continue;
        for (const trip of tripGroup) {
          const priceList = trip.totalPriceList ?? [];
          const segments = trip.sI ?? [];
          if (!segments.length || !priceList.length) continue;
          const firstSegment = segments[0];
          const cheapestPrice = priceList[0]; // already sorted cheapest-first by TripJack
          mappedResults.push({
            referenceId: encodeReference(FLIGHT_REFERENCE_PREFIX, cheapestPrice.id, cheapestPrice.id),
            ...this.flightMapper.toInventoryFlight(firstSegment),
          });
        }
      }

      return ok(mappedResults);
    }

    throw new NotImplementedError(`TripJackAdapter.search() is not implemented for capability "${criteria.capability}"`);
  }

  override async details(referenceId: string): Promise<Result<SupplierSearchResult, AppError>> {
    const decoded = decodeReference(referenceId);
    if (!decoded) return err(new ValidationError(`Malformed TripJack reference "${referenceId}"`));

    if (decoded.prefix === HOTEL_REFERENCE_PREFIX) return this.hotelDetails(decoded.id, decoded.traceId, referenceId);
    if (decoded.prefix === FLIGHT_REFERENCE_PREFIX) return this.flightDetails(decoded.id, decoded.traceId, referenceId);
    return err(new ValidationError(`Unknown TripJack reference prefix in "${referenceId}"`));
  }

  /**
   * Exposes the TripJack Review step as a callable method for the SupplierService.
   * Required before book() for flights — TripJack OMS rejects bookings
   * where /fms/v1/review has not been called first.
   */
  async reviewFlight(resultIndex: string, traceId: string): Promise<Result<any, AppError>> {
    return this.client.reviewFlight({ resultIndex, traceId });
  }

  override async book(request: SupplierBookingRequest): Promise<Result<SupplierBookingConfirmation, AppError>> {
    const decoded = decodeReference(request.referenceId);
    if (!decoded) return err(new ValidationError(`Malformed TripJack reference "${request.referenceId}"`));

    // Construct the payload for TripJack booking based on whether it is a hotel or flight.
    const tripjackRequest: any = {
      traceId: decoded.traceId,
      passengers: request.passengers,
      contactEmail: request.contactEmail,
      contactPhone: request.contactPhone,
    };

    if (decoded.prefix === HOTEL_REFERENCE_PREFIX) {
      tripjackRequest.hotelId = decoded.id;
    } else {
      if ((request as any).reviewedBookingId) {
        tripjackRequest.bookingId = (request as any).reviewedBookingId;
      } else {
        return err(new ValidationError(
          "Flight booking requires a prior Review step. Use reviewAndBook() instead of book() directly."
        ));
      }
    }

    const result = await this.client.book(tripjackRequest);
    if (isErr(result)) return result;

    const bookingId = result.value.bookingId;
    if (!bookingId) {
      return err(new InternalError(
        "TripJack booking succeeded but returned no bookingId. This indicates a supplier-side error."
      ));
    }

    return ok({
      supplierBookingId: bookingId,
      confirmationReference: bookingId,
      status: "CONFIRMED",
      timestamp: new Date().toISOString(),
      rawResponse: result.value,
    });
  }

  override async cancel(bookingReference: string): Promise<Result<SupplierCancellationResult, AppError>> {
    const result = await this.client.cancel({ bookingReference });
    if (isErr(result)) return result;
    return ok({
      cancellationId: result.value.cancellationId,
      status: "CANCELLED",
      cancelled: true,
      refundAmount: result.value.refundAmount ?? 0,
      timestamp: new Date().toISOString(),
      rawResponse: result.value,
    });
  }

  async getSeatMap(request: any): Promise<Result<any, AppError>> {
    return this.client.getSeatMap(request);
  }

  async getSsrOptions(request: any): Promise<Result<any, AppError>> {
    return this.client.getSsrOptions(request);
  }

  // sync() intentionally not overridden — same as before this sprint.

  private isConfigured(): boolean {
    return this.tripjackConfig.isConfigured() || Boolean(this.tripjackConfig.get("token"));
  }

  /** Hotel Details are cached through the Supplier Runtime's cache abstraction (`RuntimeCache`, in-memory only — no Redis) since static hotel content rarely changes within a session. Nothing else in this connector caches anything yet. */
  private async hotelDetails(hotelId: string, correlationId: string, referenceId: string, context?: { checkIn?: string; checkOut?: string; rooms?: any[]; currency?: string; nationality?: string }): Promise<Result<SupplierSearchResult, AppError>> {
    const { getRuntimeCache } = await import("@/modules/supplier/runtime");

    const cacheKey = `tripjack:hotel-details:${hotelId}:${context?.checkIn ?? "default"}`;
    const cached = await getRuntimeCache().get<SupplierSearchResult>(cacheKey);
    if (cached) return ok(cached);

    // ✅ CF-4 FIX: Derive real dates instead of hardcoded past dates.
    // Prefer caller-supplied dates (from search context); fall back to a
    // reasonable default (check-in tomorrow, check-out the day after) so
    // TripJack never sees a past date.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    const fmt = (d: Date) => d.toISOString().split("T")[0];

    const checkIn = context?.checkIn ?? fmt(tomorrow);
    const checkOut = context?.checkOut ?? fmt(dayAfter);
    const currency = context?.currency ?? "INR";
    const nationality = context?.nationality ?? "106";
    const rooms = context?.rooms ?? [{ adults: 1 }];

    const result = await this.client.getHotelDetails({
      hid: hotelId,
      correlationId,
      checkIn,
      checkOut,
      currency,
      nationality,
      rooms,
    });
    if (isErr(result)) return result;

    const firstOption = result.value.options?.[0];

    const mapped: SupplierSearchResult = {
      referenceId,
      title: result.value.hotelName,
      options: result.value.options,
      cancellationPolicy: firstOption?.cancellation,
    };
    await getRuntimeCache().set(cacheKey, mapped, HOTEL_DETAILS_CACHE_TTL_MS);
    return ok(mapped);
  }

  private async flightDetails(resultIndex: string, traceId: string, referenceId: string): Promise<Result<SupplierSearchResult, AppError>> {
    // getFlightDetails calls /fms/v1/review — returns bookingId + tripInfos with sI segments
    const result = await this.client.getFlightDetails({ resultIndex, traceId } as any);
    if (isErr(result)) return result;
    // Extract first segment for mapping — Review returns full trip details with sI array
    const firstSegment = result.value.sI?.[0];
    if (!firstSegment) {
      // Review succeeded but no segment data — return minimal result
      return ok({ referenceId, baggageAllowance: result.value.baggageAllowance, refundable: result.value.refundable ?? false } as any);
    }
    return ok({
      referenceId,
      ...this.flightMapper.toInventoryFlight(firstSegment),
      baggageAllowance: result.value.baggageAllowance,
      refundable: result.value.refundable ?? false,
    });
  }

  private toHotelSearchRequest(criteria: SupplierSearchCriteria): TripJackHotelSearchRequestDTO {
    return {
      hids: Array.isArray(criteria.hotelIds) ? criteria.hotelIds.map(id => Number(id)) : (criteria.cityCode ? [] : []), // Ideally mapped from cityCode by UI
      checkIn: typeof criteria.checkIn === "string" ? criteria.checkIn : "",
      checkOut: typeof criteria.checkOut === "string" ? criteria.checkOut : "",
      rooms: Array.isArray(criteria.rooms) ? (criteria.rooms as any) : [{ adults: 1 }],
      currency: typeof criteria.currency === "string" ? criteria.currency : "INR",
      nationality: typeof criteria.nationality === "string" ? criteria.nationality : "106",
      correlationId: crypto.randomUUID(),
    };
  }

  private toFlightSearchRequest(criteria: SupplierSearchCriteria): TripJackFlightSearchRequestDTO {
    const routeInfos: TripJackFlightSearchRequestDTO["searchQuery"]["routeInfos"] = [
      {
        fromCityOrAirport: { code: typeof criteria.origin === "string" ? criteria.origin : "" },
        toCityOrAirport: { code: typeof criteria.destination === "string" ? criteria.destination : "" },
        travelDate: typeof criteria.departureDate === "string" ? criteria.departureDate : "",
      },
    ];

    // Return flights: add a second leg
    if (typeof criteria.returnDate === "string" && criteria.returnDate) {
      routeInfos.push({
        fromCityOrAirport: { code: typeof criteria.destination === "string" ? criteria.destination : "" },
        toCityOrAirport: { code: typeof criteria.origin === "string" ? criteria.origin : "" },
        travelDate: criteria.returnDate,
      });
    }

    return {
      searchQuery: {
        cabinClass: criteria.cabinClass as TripJackFlightSearchRequestDTO["searchQuery"]["cabinClass"] ?? "ECONOMY",
        paxInfo: {
          ADULT: typeof criteria.adults === "number" ? criteria.adults : 1,
          ...(typeof criteria.children === "number" && criteria.children > 0 ? { CHILD: criteria.children } : {}),
          ...(typeof criteria.infants === "number" && criteria.infants > 0 ? { INFANT: criteria.infants } : {}),
        },
        routeInfos,
        searchModifiers: {
          pfts: "REGULAR",
        },
      },
    };
  }
}
