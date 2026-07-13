import type { PackageSourceType, PackageStatus } from "./constants";

export type { PackageSourceType, PackageStatus };

export interface PackageSeo {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  focusKeyword?: string;
}

export interface PackageFaqEntry {
  id: string;
  question: string;
  answer: string;
  position: number;
}

export interface Package {
  id: string;
  title: string;
  code: string;
  slug: string;
  destinationId: string;
  sourceType: PackageSourceType;
  durationDays: number;
  durationNights: number;
  durationText: string | null;
  isTemplate: boolean;
  sourceTemplateId: string | null;
  aiGeneratedFromId: string | null;
  status: PackageStatus;
  currentVersionId: string | null;
  seo: PackageSeo;
  faqs: PackageFaqEntry[];
  createdAt: string;
  updatedAt: string;
  content?: any;
}

export interface PackageDay {
  id: string;
  packageId: string;
  dayNumber: number;
  title: string;
  description: string | null;
  destinationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PackageItem {
  id: string;
  packageDayId: string;
  kind: string;
  resolutionMode: string;
  inventoryItemId: string | null;
  destinationReferenceId: string | null;
  slotCriteria: Record<string, unknown> | null;
  title: string;
  description: string | null;
  timeOfDay: string | null;
  notes: string | null;
  images: string[];
  pricingMode: string;
  addonPrice: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PackageDayWithItems extends PackageDay {
  items: PackageItem[];
}

export interface PriceAdjustment {
  type: "PERCENTAGE" | "FLAT";
  value: number;
}

export interface PackagePricing {
  id: string;
  packageId: string;
  basePrice: number;
  currency: string;
  markup: PriceAdjustment | null;
  discount: (PriceAdjustment & { validFrom?: string; validTo?: string }) | null;
  tax: (PriceAdjustment & { label?: string }) | null;
  occupancyPricing: unknown[];
  childPricing: unknown[];
  infantPricing: unknown | null;
  groupPricing: unknown[];
  seasonalPricing: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface PriceComputeLineItem {
  label: string;
  amount: number;
}

export interface PriceComputeResult {
  currency: string;
  basePrice: number;
  lineItems: PriceComputeLineItem[];
  total: number;
}

export interface PackageRule {
  id: string;
  packageId: string;
  cancellationTiers: { daysBeforeDeparture: number; refundPercentage: number }[];
  paymentTerms: { depositPercentage: number; fullPaymentDueDaysBeforeDeparture: number } | null;
  refundPolicy: string | null;
  bookingWindow: { minDaysBeforeDeparture: number | null; maxDaysBeforeDeparture: number | null } | null;
  minPax: number;
  maxPax: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PackageAvailability {
  id: string;
  packageId: string;
  validFrom: string;
  validTo: string;
  blackoutDates: string[];
  maxBookingsPerDay: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PackageVersion {
  id: string;
  packageId: string;
  versionNumber: number;
  snapshot: unknown;
  publishedAt: string;
  changeNote: string | null;
}

export interface PackagePreview {
  package: Package;
  days: PackageDayWithItems[];
  pricing: PackagePricing | null;
  rules: PackageRule | null;
}

export interface PackageListRow extends Package {
  destinationName: string;
  displayPrice: number | null;
  currency: string | null;
}

export interface PaginatedPackages {
  items: PackageListRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type PackageSortField =
  | "updatedAt"
  | "createdAt"
  | "title"
  | "status"
  | "durationDays"
  | "displayPrice";

export type SortDirection = "asc" | "desc";

export interface PackageListFilters {
  status?: PackageStatus;
  destinationId?: string;
  sourceType?: PackageSourceType;
  search?: string;
  sortBy?: PackageSortField;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
}

export interface CreatePackageInput {
  title: string;
  destinationId: string;
  durationDays: number;
  durationNights: number;
  durationText?: string | null;
  sourceType?: PackageSourceType;
  code?: string;
  slug?: string;
  seo?: PackageSeo;
}

export interface UpdatePackageInput {
  title?: string;
  seo?: PackageSeo;
}

export interface UpsertPricingInput {
  basePrice: number;
  currency: string;
  markup: PriceAdjustment | null;
  discount: (PriceAdjustment & { validFrom?: string; validTo?: string }) | null;
  tax: (PriceAdjustment & { label?: string }) | null;
}

export interface UpsertRulesInput {
  cancellationTiers: { daysBeforeDeparture: number; refundPercentage: number }[];
  paymentTerms: { depositPercentage: number; fullPaymentDueDaysBeforeDeparture: number } | null;
  refundPolicy: string | null;
  bookingWindow: { minDaysBeforeDeparture: number | null; maxDaysBeforeDeparture: number | null } | null;
  minPax: number;
  maxPax: number | null;
}

export interface CreateDayInput {
  dayNumber: number;
  title: string;
  description?: string | null;
  destinationId?: string | null;
}

export interface CreateItemInput {
  kind: string;
  title: string;
  resolutionMode?: string;
  inventoryItemId?: string | null;
  destinationReferenceId?: string | null;
  slotCriteria?: Record<string, unknown> | null;
  description?: string | null;
  timeOfDay?: string | null;
  notes?: string | null;
  images?: string[];
  pricingMode?: string;
  addonPrice?: number | null;
}

export interface CreateAvailabilityInput {
  validFrom: string;
  validTo: string;
  blackoutDates?: string[];
  maxBookingsPerDay?: number | null;
}
