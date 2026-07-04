export { PackageDetailPage } from "./components/PackageDetailPage";
export { PackageGallery } from "./components/PackageGallery";
export { PackagePriceCard } from "./components/PackagePriceCard";
export { PackageItinerary } from "./components/PackageItinerary";
export { PackageInclusions } from "./components/PackageInclusions";
export { PackageOverviewHeader, PackageOverviewBody } from "./components/PackageOverview";
export { RelatedPackagesRail } from "./components/RelatedPackagesRail";
export { PackageMobileCta } from "./components/PackageMobileCta";

export { packagesFeatureService } from "./services/packages.feature.service";
export { usePackageDetail, useRelatedPackages } from "./hooks/usePackageDetail";
export { packageDetailPath, packageListingPath } from "./paths";
export { generateItinerary, resolveItinerary, DEFAULT_INCLUSIONS, DEFAULT_EXCLUSIONS } from "./utils/itinerary";

export type { Package } from "@/lib/models";
