import type { DestinationStatus } from "./constants";

export type { DestinationStatus };

export interface DestinationSeo {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  focusKeyword?: string;
}

export interface DestinationFaqEntry {
  id: string;
  question: string;
  answer: string;
  position: number;
}

export interface DestinationGalleryImage {
  id: string;
  url: string;
  altText?: string;
  position: number;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  countryId: string;
  stateId: string | null;
  cityId: string | null;
  regionId: string | null;
  parentDestinationId: string | null;
  categoryIds: string[];
  description: string | null;
  isFeatured: boolean;
  latitude: number | null;
  longitude: number | null;
  seo: DestinationSeo;
  gallery: DestinationGalleryImage[];
  faqs: DestinationFaqEntry[];
  guideReferenceIds: string[];
  status: DestinationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DestinationBreadcrumb {
  id: string;
  name: string;
  slug: string;
}

export interface DestinationCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Country {
  id: string;
  name: string;
  isoCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface State {
  id: string;
  countryId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Region {
  id: string;
  name: string;
  countryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  countryId: string;
  stateId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface DestinationListRow extends Destination {
  countryName: string;
  stateName: string;
  regionName: string;
  categoryLabel: string;
}

export interface PaginatedDestinations {
  items: DestinationListRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type DestinationSortField = "updatedAt" | "createdAt" | "name" | "status" | "slug";

export type SortDirection = "asc" | "desc";

export interface DestinationListFilters {
  countryId?: string;
  stateId?: string;
  regionId?: string;
  categoryId?: string;
  status?: DestinationStatus;
  search?: string;
  sortBy?: DestinationSortField;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
}

export interface CreateDestinationInput {
  name: string;
  slug?: string;
  countryId: string;
  stateId?: string | null;
  cityId?: string | null;
  regionId?: string | null;
  parentDestinationId?: string | null;
  categoryIds?: string[];
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  seo?: DestinationSeo;
}

export interface UpdateDestinationInput {
  name?: string;
  description?: string | null;
  categoryIds?: string[];
  isFeatured?: boolean;
  seo?: DestinationSeo;
}

export interface CreateFaqInput {
  question: string;
  answer: string;
  position?: number;
}

export interface CreateGalleryImageInput {
  url: string;
  altText?: string;
  position?: number;
}
