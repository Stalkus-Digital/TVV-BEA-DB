import type { Destination, DestinationBreadcrumb } from "@/modules/destination";
import { buildSeoDTO } from "../seo/seo-builder";
import type { WebsiteBreadcrumbDTO } from "../dto/website-seo.dto";
import type { WebsiteDestinationDetailDTO, WebsiteDestinationSummaryDTO } from "../dto/website-destination.dto";
import type { WebsitePackageSummaryDTO } from "../dto/website-package.dto";

export function toDestinationSummary(destination: Destination): WebsiteDestinationSummaryDTO {
  return {
    slug: destination.slug,
    name: destination.name,
    heroImage: destination.seo.ogImageUrl ?? destination.gallery[0]?.url ?? null,
  };
}

export function toWebsiteBreadcrumbs(breadcrumbs: DestinationBreadcrumb[]): WebsiteBreadcrumbDTO[] {
  return breadcrumbs.map((crumb) => ({ label: crumb.name, url: `/destination/${crumb.slug}` }));
}

export interface DestinationDetailInput {
  destination: Destination;
  featuredPackages: WebsitePackageSummaryDTO[];
  nearbyDestinations: Destination[];
  breadcrumbs: DestinationBreadcrumb[];
  baseUrl: string;
}

export function toDestinationDetail(input: DestinationDetailInput): WebsiteDestinationDetailDTO {
  const summary = toDestinationSummary(input.destination);

  const seo = buildSeoDTO(
    input.baseUrl,
    {
      metaTitle: input.destination.seo.metaTitle,
      metaDescription: input.destination.seo.metaDescription,
      canonicalUrl: input.destination.seo.canonicalUrl,
      ogImageUrl: input.destination.seo.ogImageUrl,
    },
    {
      title: input.destination.name,
      description: input.destination.description ?? `Explore ${input.destination.name}`,
      path: `/destination/${input.destination.slug}`,
    }
  );

  return {
    ...summary,
    gallery: input.destination.gallery.map((g) => g.url),
    faqs: input.destination.faqs.map((f) => ({ question: f.question, answer: f.answer })),
    guides: [],
    featuredPackages: input.featuredPackages,
    nearbyDestinations: input.nearbyDestinations.map(toDestinationSummary),
    breadcrumbs: toWebsiteBreadcrumbs(input.breadcrumbs),
    seo,
  };
}
