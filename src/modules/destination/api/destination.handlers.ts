import type { AppError } from "@/shared/errors";
import type { PaginatedResult, Result } from "@/shared/types";
import { getDestinationService } from "../module";
import type { Destination, DestinationBreadcrumb } from "../types/destination";
import type { ListDestinationsQuery } from "./dto";

export async function listDestinationsHandler(
  query: ListDestinationsQuery
): Promise<Result<PaginatedResult<Destination>, AppError>> {
  return getDestinationService().list(query);
}

export async function listFeaturedDestinationsHandler(): Promise<Result<Destination[], AppError>> {
  return getDestinationService().listFeatured();
}

export async function getDestinationHandler(id: string): Promise<Result<Destination, AppError>> {
  return getDestinationService().getById(id);
}

export async function getDestinationBySlugHandler(slug: string): Promise<Result<Destination, AppError>> {
  return getDestinationService().getBySlug(slug);
}

export async function createDestinationHandler(body: unknown): Promise<Result<Destination, AppError>> {
  return getDestinationService().create(body);
}

export async function updateDestinationHandler(id: string, body: unknown): Promise<Result<Destination, AppError>> {
  return getDestinationService().update(id, body);
}

export async function archiveDestinationHandler(id: string): Promise<Result<Destination, AppError>> {
  return getDestinationService().archive(id);
}

export async function getDestinationChildrenHandler(id: string): Promise<Result<Destination[], AppError>> {
  return getDestinationService().getChildren(id);
}

export async function getDestinationBreadcrumbsHandler(
  id: string
): Promise<Result<DestinationBreadcrumb[], AppError>> {
  return getDestinationService().getBreadcrumbs(id);
}

export async function getDestinationNearbyHandler(id: string): Promise<Result<Destination[], AppError>> {
  return getDestinationService().getNearby(id);
}

export async function addDestinationFaqHandler(id: string, body: unknown): Promise<Result<Destination, AppError>> {
  return getDestinationService().addFaq(id, body);
}

export async function removeDestinationFaqHandler(id: string, faqId: string): Promise<Result<Destination, AppError>> {
  return getDestinationService().removeFaq(id, faqId);
}

export async function updateDestinationFaqHandler(id: string, faqId: string, body: unknown): Promise<Result<Destination, AppError>> {
  return getDestinationService().updateFaq(id, faqId, body);
}

export async function addDestinationGalleryImageHandler(
  id: string,
  body: unknown
): Promise<Result<Destination, AppError>> {
  return getDestinationService().addGalleryImage(id, body);
}

export async function removeDestinationGalleryImageHandler(
  id: string,
  imageId: string
): Promise<Result<Destination, AppError>> {
  return getDestinationService().removeGalleryImage(id, imageId);
}
