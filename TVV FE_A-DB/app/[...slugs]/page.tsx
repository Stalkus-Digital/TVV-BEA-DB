import {
  PublicHierarchyPage,
  destinationsFeatureService,
} from "@/features/destinations";
import {
  buildSeoMetadata,
  isReservedTopLevelSlug,
} from "@/lib/hierarchy";
import { notFound, permanentRedirect, redirect as nextRedirect } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slugs: string[] }>;
}): Promise<Metadata> {
  const { slugs } = await params;
  if (slugs.length > 0 && isReservedTopLevelSlug(slugs[0])) {
    return buildSeoMetadata({ canonicalPath: "/", indexable: false });
  }

  const resolution = await destinationsFeatureService.resolveHierarchyUrl(slugs);
  if (resolution.kind === "not_found") {
    return buildSeoMetadata({
      title: "Not Found",
      canonicalPath: `/${slugs.join("/")}`,
      indexable: false,
    });
  }

  const node =
    resolution.kind === "category"
      ? resolution.category
      : resolution.kind === "destination"
        ? resolution.destination
        : resolution.country;

  const { buildCategoryPath, buildCountryPath, buildDestinationPath } = await import("@/lib/hierarchy");

  const canonicalPath =
    resolution.kind === "category"
      ? buildCategoryPath({
          country: resolution.country.slug,
          destination: resolution.destination.slug,
          category: resolution.category.slug,
        })
      : resolution.kind === "destination"
        ? buildDestinationPath({
            country: resolution.country.slug,
            destination: resolution.destination.slug,
          })
        : buildCountryPath({ country: resolution.country.slug });

  return buildSeoMetadata({
    title: node.metaTitle ?? `${node.name} — The Vacation Voice`,
    description: node.metaDescription,
    canonicalPath,
    imageUrl: node.heroImageUrl,
    ogType: "website",
  });
}

export default async function RootHierarchyCatchAllPage({
  params,
}: {
  params: Promise<{ slugs: string[] }>;
}) {
  const { slugs } = await params;

  if (slugs.length > 0 && isReservedTopLevelSlug(slugs[0])) notFound();

  const requestedPath = `/${slugs.join("/")}`;
  const redirectHit = await destinationsFeatureService.lookupRedirect(requestedPath);
  if (redirectHit && redirectHit.toPath !== requestedPath) {
    if (redirectHit.statusCode === 301 || redirectHit.statusCode === 308) {
      permanentRedirect(redirectHit.toPath);
    }
    nextRedirect(redirectHit.toPath);
  }

  const resolution = await destinationsFeatureService.resolveHierarchyUrl(slugs);
  if (resolution.kind === "not_found") notFound();

  const crumbs = destinationsFeatureService.buildPublicBreadcrumbs(resolution);

  return <PublicHierarchyPage resolution={resolution} crumbs={crumbs} />;
}
