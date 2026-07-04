import type { Package } from "@/lib/models";

export function packageDetailPath(slug: string): string {
  return `/packages/${slug}`;
}

export function packageListingPath(region: Package["region"]): string {
  return region === "international" ? "/packages/international" : "/packages/domestic";
}
