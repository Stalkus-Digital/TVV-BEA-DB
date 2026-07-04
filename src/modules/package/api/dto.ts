import type { PackageSourceType, PackageStatus } from "../types/package";

export interface ListPackagesQuery {
  destinationId?: string;
  status?: PackageStatus;
  sourceType?: PackageSourceType;
  isTemplate?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CloneOverridesBody {
  title?: string;
  destinationId?: string;
}
