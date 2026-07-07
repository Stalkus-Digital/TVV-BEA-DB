import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import type { Destination } from "@/features/admin-destinations/types";
import type { Package } from "@/features/admin-packages/types";
import { fetchAllDestinations } from "@/features/admin-destinations/api/destinations";
import { fetchAllPackages } from "@/features/admin-packages/api/packages";
import type { HomepageResponse, NavigationResponse } from "../types";

export async function fetchWebsiteHome(): Promise<HomepageResponse> {
  const result = await adminApiClient.get<HomepageResponse>("/api/website/home");
  if (!result) throw new Error("Failed to load homepage");
  return result;
}

export async function fetchWebsiteNavigation(): Promise<NavigationResponse> {
  const result = await adminApiClient.get<NavigationResponse>("/api/website/navigation");
  if (!result) throw new Error("Failed to load navigation");
  return result;
}

export async function fetchFeaturedDestinations(): Promise<Destination[]> {
  const result = await adminApiClient.get<Destination[]>("/api/destinations/featured");
  return result ?? [];
}

export async function fetchCmsDestinations(): Promise<Destination[]> {
  return fetchAllDestinations();
}

export async function fetchCmsPackages(): Promise<Package[]> {
  return fetchAllPackages();
}

export async function updateDestinationFeatured(id: string, isFeatured: boolean): Promise<Destination> {
  const result = await adminApiClient.patch<Destination>(`${adminEndpoints.destinations}/${id}`, { isFeatured });
  if (!result) throw new Error("Failed to update featured status");
  return result;
}

export async function updateDestinationSeo(id: string, seo: Destination["seo"]): Promise<Destination> {
  const result = await adminApiClient.patch<Destination>(`${adminEndpoints.destinations}/${id}`, { seo });
  if (!result) throw new Error("Failed to update destination SEO");
  return result;
}

export async function updatePackageSeo(id: string, seo: Package["seo"]): Promise<Package> {
  const result = await adminApiClient.patch<Package>(`${adminEndpoints.packages}/${id}`, { seo });
  if (!result) throw new Error("Failed to update package SEO");
  return result;
}

export async function addDestinationFaq(
  id: string,
  input: { question: string; answer: string; position?: number }
): Promise<Destination> {
  const result = await adminApiClient.post<Destination>(`${adminEndpoints.destinations}/${id}/faqs`, input);
  if (!result) throw new Error("Failed to add destination FAQ");
  return result;
}

export async function removeDestinationFaq(id: string, faqId: string): Promise<Destination> {
  const result = await adminApiClient.delete<Destination>(`${adminEndpoints.destinations}/${id}/faqs/${faqId}`);
  if (!result) throw new Error("Failed to remove destination FAQ");
  return result;
}

export async function addPackageFaq(
  id: string,
  input: { question: string; answer: string; position?: number }
): Promise<Package> {
  const result = await adminApiClient.post<Package>(`${adminEndpoints.packages}/${id}/faqs`, input);
  if (!result) throw new Error("Failed to add package FAQ");
  return result;
}

export async function removePackageFaq(id: string, faqId: string): Promise<Package> {
  const result = await adminApiClient.delete<Package>(`${adminEndpoints.packages}/${id}/faqs/${faqId}`);
  if (!result) throw new Error("Failed to remove package FAQ");
  return result;
}
