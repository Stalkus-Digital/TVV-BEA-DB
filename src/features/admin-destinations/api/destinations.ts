import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import type { PaginatedResult } from "@/lib/admin-api/types";
import type {
  City,
  Country,
  CreateDestinationInput,
  CreateFaqInput,
  CreateGalleryImageInput,
  Destination,
  DestinationBreadcrumb,
  DestinationCategory,
  DestinationListFilters,
  Region,
  State,
  UpdateDestinationInput,
} from "../types";

function destinationPath(id: string) {
  return `${adminEndpoints.destinations}/${id}`;
}

export async function fetchDestinations(filters: DestinationListFilters = {}): Promise<PaginatedResult<Destination>> {
  const result = await adminApiClient.get<PaginatedResult<Destination>>(adminEndpoints.destinations, {
    params: {
      countryId: filters.countryId,
      stateId: filters.stateId,
      categoryId: filters.categoryId,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
    },
  });
  if (!result) {
    return { items: [], page: 1, pageSize: filters.pageSize ?? 20, total: 0, totalPages: 1 };
  }
  return result;
}

export async function fetchAllDestinations(
  filters: Pick<DestinationListFilters, "countryId" | "stateId" | "categoryId"> = {}
): Promise<Destination[]> {
  const pageSize = 20;
  let page = 1;
  let totalPages = 1;
  const items: Destination[] = [];

  while (page <= totalPages) {
    const result = await fetchDestinations({ ...filters, page, pageSize });
    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  return items;
}

export async function fetchDestination(id: string): Promise<Destination> {
  const result = await adminApiClient.get<Destination>(destinationPath(id));
  if (!result) throw new Error("Destination not found");
  return result;
}

export async function createDestination(input: CreateDestinationInput): Promise<Destination> {
  const result = await adminApiClient.post<Destination>(adminEndpoints.destinations, input);
  if (!result) throw new Error("Failed to create destination");
  return result;
}

export async function updateDestination(id: string, input: UpdateDestinationInput): Promise<Destination> {
  const result = await adminApiClient.patch<Destination>(destinationPath(id), input);
  if (!result) throw new Error("Failed to update destination");
  return result;
}

export async function archiveDestination(id: string): Promise<void> {
  await adminApiClient.delete<void>(destinationPath(id));
}

export async function fetchDestinationBreadcrumbs(id: string): Promise<DestinationBreadcrumb[]> {
  const result = await adminApiClient.get<DestinationBreadcrumb[]>(`${destinationPath(id)}/breadcrumbs`);
  return result ?? [];
}

export async function fetchDestinationChildren(id: string): Promise<Destination[]> {
  const result = await adminApiClient.get<Destination[]>(`${destinationPath(id)}/children`);
  return result ?? [];
}

export async function fetchDestinationNearby(id: string): Promise<Destination[]> {
  const result = await adminApiClient.get<Destination[]>(`${destinationPath(id)}/nearby`);
  return result ?? [];
}

export async function addDestinationFaq(id: string, input: CreateFaqInput): Promise<Destination> {
  const result = await adminApiClient.post<Destination>(`${destinationPath(id)}/faqs`, input);
  if (!result) throw new Error("Failed to add FAQ");
  return result;
}

export async function removeDestinationFaq(id: string, faqId: string): Promise<Destination> {
  const result = await adminApiClient.delete<Destination>(`${destinationPath(id)}/faqs/${faqId}`);
  if (!result) throw new Error("Failed to remove FAQ");
  return result;
}

export async function addDestinationGalleryImage(id: string, input: CreateGalleryImageInput): Promise<Destination> {
  const result = await adminApiClient.post<Destination>(`${destinationPath(id)}/gallery`, input);
  if (!result) throw new Error("Failed to add gallery image");
  return result;
}

export async function removeDestinationGalleryImage(id: string, imageId: string): Promise<Destination> {
  const result = await adminApiClient.delete<Destination>(`${destinationPath(id)}/gallery/${imageId}`);
  if (!result) throw new Error("Failed to remove gallery image");
  return result;
}

export async function fetchDestinationCategories(): Promise<DestinationCategory[]> {
  const result = await adminApiClient.get<PaginatedResult<DestinationCategory>>(`${adminEndpoints.destinations}/categories`);
  return result?.items ?? [];
}

export async function createDestinationCategory(input: { name: string; slug: string; description?: string }): Promise<DestinationCategory> {
  const result = await adminApiClient.post<DestinationCategory>(`${adminEndpoints.destinations}/categories`, input);
  if (!result) throw new Error("Failed to create destination category");
  return result;
}

export async function fetchCountries(): Promise<Country[]> {
  const result = await adminApiClient.get<PaginatedResult<Country>>("/api/geography/countries");
  return result?.items ?? [];
}

export async function fetchStates(countryId?: string): Promise<State[]> {
  const result = await adminApiClient.get<State[]>("/api/geography/states", {
    params: countryId ? { countryId } : undefined,
  });
  return result ?? [];
}

export async function fetchAllStates(): Promise<State[]> {
  return fetchStates();
}

export async function fetchRegions(countryId?: string): Promise<Region[]> {
  const result = await adminApiClient.get<Region[]>("/api/geography/regions", {
    params: countryId ? { countryId } : undefined,
  });
  return result ?? [];
}

export async function fetchCities(filter: { countryId?: string; stateId?: string } = {}): Promise<City[]> {
  const result = await adminApiClient.get<City[]>("/api/geography/cities", { params: filter });
  return result ?? [];
}

export async function fetchAllCities(): Promise<City[]> {
  return fetchCities();
}
