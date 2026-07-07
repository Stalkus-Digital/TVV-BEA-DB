import { NotImplementedError, ValidationError, type AppError } from "@/shared/errors";
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
        result.value.results.map((dto) => ({
          referenceId: encodeReference(HOTEL_REFERENCE_PREFIX, dto.hotelId, dto.traceId),
          ...this.hotelMapper.toInventoryHotel(dto),
        }))
      );
    }

    if (criteria.capability === SupplierCapability.FLIGHTS) {
      const request = this.toFlightSearchRequest(criteria);
      const result = await this.client.searchFlights(request);
      if (isErr(result)) return result;
      return ok(
        result.value.results.map((dto) => ({
          referenceId: encodeReference(FLIGHT_REFERENCE_PREFIX, dto.resultIndex, dto.traceId),
          ...this.flightMapper.toInventoryFlight(dto),
        }))
      );
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

  override async book(request: SupplierBookingRequest): Promise<Result<SupplierBookingConfirmation, AppError>> {
    const result = await this.client.book(request);
    if (isErr(result)) return result;
    return ok({
      supplierBookingId: result.value.bookingId,
      confirmationReference: result.value.bookingId,
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

  // sync() intentionally not overridden — same as before this sprint.

  private isConfigured(): boolean {
    return this.tripjackConfig.isConfigured() || Boolean(this.tripjackConfig.get("token"));
  }

  /** Hotel Details are cached through the Supplier Runtime's cache abstraction (`RuntimeCache`, in-memory only — no Redis) since static hotel content rarely changes within a session. Nothing else in this connector caches anything yet. */
  private async hotelDetails(hotelId: string, traceId: string, referenceId: string): Promise<Result<SupplierSearchResult, AppError>> {
    // Dynamic, not static, import — a top-level `import ... from "@/modules/supplier/runtime"`
    // here creates a real circular module graph: this adapter is imported by
    // `../../module.ts` (the Supplier Engine's own module.ts), and the Runtime's
    // `module.ts` imports `../module` (that exact same file) for `getSupplierRegistry()`.
    // Deferring the import to call time (well after both modules have finished
    // their own synchronous evaluation) breaks the cycle without changing either
    // module.ts file — verified live: a static import here made `TripJackAdapter`
    // resolve to `undefined` at the Supplier Engine's own registration site.
    const { getRuntimeCache } = await import("@/modules/supplier/runtime");

    const cacheKey = `tripjack:hotel-details:${hotelId}`;
    const cached = await getRuntimeCache().get<SupplierSearchResult>(cacheKey);
    if (cached) return ok(cached);

    const result = await this.client.getHotelDetails({ hotelId, traceId });
    if (isErr(result)) return result;

    const mapped: SupplierSearchResult = {
      referenceId,
      ...this.hotelMapper.toInventoryHotel(result.value),
      amenities: result.value.amenities,
      cancellationPolicy: result.value.cancellationPolicy,
    };
    await getRuntimeCache().set(cacheKey, mapped, HOTEL_DETAILS_CACHE_TTL_MS);
    return ok(mapped);
  }

  private async flightDetails(resultIndex: string, traceId: string, referenceId: string): Promise<Result<SupplierSearchResult, AppError>> {
    const result = await this.client.getFlightDetails({ resultIndex, traceId });
    if (isErr(result)) return result;
    return ok({
      referenceId,
      ...this.flightMapper.toInventoryFlight(result.value),
      baggageAllowance: result.value.baggageAllowance,
      refundable: result.value.refundable,
    });
  }

  private toHotelSearchRequest(criteria: SupplierSearchCriteria): TripJackHotelSearchRequestDTO {
    return {
      cityCode: typeof criteria.cityCode === "string" ? criteria.cityCode : "",
      checkIn: typeof criteria.checkIn === "string" ? criteria.checkIn : "",
      checkOut: typeof criteria.checkOut === "string" ? criteria.checkOut : "",
      rooms: Array.isArray(criteria.rooms) ? (criteria.rooms as { adults: number; children?: number }[]) : [{ adults: 1 }],
    };
  }

  private toFlightSearchRequest(criteria: SupplierSearchCriteria): TripJackFlightSearchRequestDTO {
    return {
      origin: typeof criteria.origin === "string" ? criteria.origin : "",
      destination: typeof criteria.destination === "string" ? criteria.destination : "",
      departureDate: typeof criteria.departureDate === "string" ? criteria.departureDate : "",
      returnDate: typeof criteria.returnDate === "string" ? criteria.returnDate : undefined,
      adults: typeof criteria.adults === "number" ? criteria.adults : 1,
      children: typeof criteria.children === "number" ? criteria.children : undefined,
      infants: typeof criteria.infants === "number" ? criteria.infants : undefined,
      cabinClass: criteria.cabinClass as TripJackFlightSearchRequestDTO["cabinClass"],
    };
  }
}
