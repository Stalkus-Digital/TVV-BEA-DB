import { notFound, permanentRedirect, redirect as nextRedirect } from "next/navigation";
import type { Metadata } from "next";
import {
  SlugPathDestinationPage,
  destinationSlugPathHref,
  destinationsFeatureService,
} from "@/features/destinations";
import { buildSeoMetadata } from "@/lib/hierarchy";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slugs: string[] }>;
}): Promise<Metadata> {
  const { slugs } = await params;
  const dest = await destinationsFeatureService.resolveDestination(slugs);
  if (!dest) {
    return buildSeoMetadata({
      title: "Destination not found",
      canonicalPath: `/destinations/${slugs.join("/")}`,
      indexable: false,
    });
  }

  return buildSeoMetadata({
    title: dest.metaTitle ?? `${dest.name} — The Vacation Voice`,
    description: dest.metaDescription,
    canonicalPath: destinationSlugPathHref(dest.slugPath),
    imageUrl: dest.heroImageUrl,
    ogType: "website",
  });
}

export default async function DestinationsCatchAllPage({
  params,
}: {
  params: Promise<{ slugs: string[] }>;
}) {
  const { slugs } = await params;

  const requestedPath = `/destinations/${slugs.join("/")}`;
  const redirectHit = await destinationsFeatureService.lookupRedirect(requestedPath);
  if (redirectHit && redirectHit.toPath !== requestedPath) {
    if (redirectHit.statusCode === 301 || redirectHit.statusCode === 308) {
      permanentRedirect(redirectHit.toPath);
    }
    nextRedirect(redirectHit.toPath);
  }

  const dest = await destinationsFeatureService.resolveDestination(slugs);
  if (!dest) notFound();

  const breadcrumbs = await destinationsFeatureService.buildBreadcrumbs(dest.slugPath);

  return <SlugPathDestinationPage destination={dest} breadcrumbs={breadcrumbs} />;
}
