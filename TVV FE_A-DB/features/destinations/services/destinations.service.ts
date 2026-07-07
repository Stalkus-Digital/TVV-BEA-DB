import { destinationsService as legacyDestinationsService } from "@/lib/services/destinations.service";
import {
  buildBreadcrumbs,
  buildPublicBreadcrumbs,
  fetchDestinationRelatedContent,
  getDestinationTree,
  getNavigationTree,
  hierarchyDb,
  listCategoriesForDestination,
  listPackagesForCategory,
  lookupRedirect,
  resolveDestination,
  resolveHierarchyUrl,
} from "@/lib/hierarchy";
import { fetchNavigationTree } from "@/lib/api/destinations";
import { destinationSlugPathHref } from "../paths";

export const destinationsFeatureService = {
  resolveHierarchyUrl,
  resolveDestination,
  buildPublicBreadcrumbs,
  buildBreadcrumbs,
  lookupRedirect,
  listCategoriesForDestination,
  listPackagesForCategory,
  fetchDestinationRelatedContent,
  getNavigationTree,
  getDestinationTree,
  fetchNavigationTree,

  legacyGetBySlug(slug: string) {
    return legacyDestinationsService.getBySlug(slug);
  },

  async listPublishedChildren(parentId: string) {
    return hierarchyDb.destination.findMany({
      where: { parentId: BigInt(parentId), status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        slugPath: true,
        level: true,
        heroImageUrl: true,
        imageUrl: true,
      },
    });
  },

  destinationHref(slugPath: string) {
    return destinationSlugPathHref(slugPath);
  },
};
