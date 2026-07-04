import { getLegacyPackageDetail, listLegacyPackages, type LegacyPackageListQuery } from "../services/legacy-package.service";

export function listLegacyPackagesHandler(query: LegacyPackageListQuery) {
  return listLegacyPackages(query);
}

export function getLegacyPackageDetailHandler(slug: string) {
  return getLegacyPackageDetail(slug);
}
