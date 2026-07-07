import { packagesService } from "@/lib/services/packages.service";
import {
  fetchFeaturedPackages,
  fetchPackageBySlug,
  fetchPackages,
  fetchRelatedPackages,
  type PackageListParams,
} from "@/lib/api/packages";

export const packagesFeatureService = {
  getBySlug(slug: string) {
    return packagesService.getBySlug(slug);
  },

  getRelated(slug: string, limit = 6) {
    return packagesService.getRelated(slug, limit);
  },

  list(params: PackageListParams = {}) {
    return packagesService.listRemote(params as Record<string, string>);
  },

  featured(limit = 8) {
    return packagesService.featured(limit);
  },

  /** Direct API access for TanStack Query hooks (live mode). */
  api: {
    fetchBySlug: fetchPackageBySlug,
    fetchRelated: fetchRelatedPackages,
    fetchList: fetchPackages,
    fetchFeatured: fetchFeaturedPackages,
  },
};
