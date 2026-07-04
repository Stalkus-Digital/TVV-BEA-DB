/**
 * Barrel export — single import surface for all domain models.
 *
 * Import from "@/lib/models", never reach into individual files. This lets us
 * reorganise the internal structure without rippling through consumers.
 */

export type {
  // common
  Region,
  Currency,
  CardBadge,
  PackageSource,
  DestinationPill,
  Pricing,
  PricingBreakdown,
  MediaAsset,
  Hero,
  SeoMeta,
  AuditFields,
  GeoPoint,
} from "./common";

export type {
  // packages
  Package,
  ManualPackage,
  VendorPackage,
  ItineraryDay,
  Policy,
  PackageVendorRef,
} from "./package";

export type { Destination } from "./destination";

export type {
  // ferry
  FerryOperator,
  FerryClass,
  FerryPort,
  FerrySchedule,
  FerryRoute,
  FerryAvailability,
  FerrySearchInput,
  FerrySearchResult,
} from "./ferry";

export type {
  // flight
  CabinClass,
  TripType,
  Airport,
  Airline,
  FlightSegment,
  FlightLeg,
  FlightFare,
  FlightItinerary,
  FlightSearchInput,
  FlightSearchResponse,
} from "./flight";

export type { Experience } from "./experience";
export type { FAQ } from "./faq";
export type { Review } from "./review";
export type { Guide, Reel, AndamanTileItem } from "./guide";
export type {
  TravelStyle,
  CalculatorInput,
  CalculatorBreakdown,
  CalculatorEstimate,
} from "./calculator";
