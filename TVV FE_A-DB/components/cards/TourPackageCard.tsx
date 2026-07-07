/**
 * @deprecated — Use `PackageCard` from "@/components/cards/PackageCard" instead.
 *
 * This is a thin compatibility wrapper retained while consumers migrate from
 * the legacy `tour` prop to the unified `data` prop. The two components render
 * identical visuals.
 */

import type { Package } from "@/lib/models";
import { PackageCard } from "./PackageCard";

interface TourPackageCardProps {
  tour: Package;
  className?: string;
  priority?: boolean;
}

export function TourPackageCard({ tour, className, priority }: TourPackageCardProps) {
  return <PackageCard data={tour} className={className} priority={priority} />;
}
