import type { WebsiteBreadcrumbDTO, WebsiteJsonLdDTO } from "../dto/website-seo.dto";

/**
 * Placeholder structured-data builders, per this sprint's explicit "JSON-LD
 * placeholders" scope — shapes exist so the frontend has something to
 * render, but the schema.org payloads have not been validated for
 * correctness/completeness. Revisit before relying on these for real SEO.
 */
export function buildBreadcrumbJsonLd(breadcrumbs: WebsiteBreadcrumbDTO[]): WebsiteJsonLdDTO {
  return {
    schemaType: "BreadcrumbList",
    data: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        item: crumb.url,
      })),
    },
  };
}

export function buildTouristTripJsonLd(input: {
  name: string;
  description: string;
  url: string;
  image: string | null;
  durationDays: number;
}): WebsiteJsonLdDTO {
  return {
    schemaType: "TouristTrip",
    data: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: input.name,
      description: input.description,
      url: input.url,
      ...(input.image ? { image: input.image } : {}),
      itinerary: { "@type": "ItemList", numberOfItems: input.durationDays },
    },
  };
}
