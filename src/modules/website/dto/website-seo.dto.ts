export interface WebsiteSeoDTO {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
}

export interface WebsiteBreadcrumbDTO {
  label: string;
  url: string;
}

/**
 * "JSON-LD placeholders" per this sprint's explicit brief — the shape
 * exists so the frontend can render a <script type="application/ld+json">
 * tag, but the schema.org payload has not been validated against real
 * structured-data requirements. Treat `data` as provisional.
 */
export interface WebsiteJsonLdDTO {
  schemaType: string;
  data: Record<string, unknown>;
}
