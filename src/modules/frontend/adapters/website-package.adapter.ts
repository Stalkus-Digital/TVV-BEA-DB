import {
  getWebsitePackageDetailHandler,
  listWebsitePackagesHandler,
} from "@/modules/website";

/**
 * Thin pass-through to the Website module's own handlers — no filtering,
 * pagination math, or business logic lives here; that's the Website
 * module's job. This file exists only so the compatibility layer's
 * services/ don't import `@/modules/website`'s handlers directly, keeping
 * the dependency direction explicit (frontend module → adapter → website
 * module), per "do not duplicate business logic."
 */
export function fetchPackageList(filter: { destinationSlug?: string; page?: number; pageSize?: number }) {
  return listWebsitePackagesHandler(filter);
}

export function fetchPackageDetail(slug: string) {
  return getWebsitePackageDetailHandler(slug);
}
