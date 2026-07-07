export const MARKETING_SECTIONS = [
  { href: "/marketing", label: "Marketing Dashboard", description: "Leads, funnel, and website highlights" },
  { href: "/marketing/campaigns", label: "Campaigns", description: "Marketing campaigns" },
  { href: "/marketing/landing-pages", label: "Landing Pages", description: "Public website pages" },
  { href: "/marketing/forms", label: "Forms", description: "Enquiry and quote form stats" },
  { href: "/marketing/seo", label: "SEO Dashboard", description: "Destination and package SEO" },
  { href: "/marketing/content", label: "Content Performance", description: "Featured and recent content" },
] as const;

export const BACKEND_GAPS = {
  campaigns: "No Campaign model or /api/campaigns/* endpoints exist — campaigns cannot be listed or managed.",
  websiteTraffic: "No website traffic or analytics API exists — page views and sessions are unavailable.",
  topPagesAnalytics: "No popularity or page-view analytics API — 'top' rankings cannot be computed.",
  landingPageCms: "No dedicated landing-page CMS — public pages are derived from Website BFF + published packages/destinations.",
  formAggregation: "No /api/marketing/forms aggregation endpoint — stats are derived client-side from enquiries and quotes.",
  conversionTracking: "No marketing attribution or UTM analytics — funnel counts are enquiry/quote/booking totals only.",
  staticPageSeo: "Navigation menu URLs are static in Website BFF — no per-page SEO API for static routes.",
} as const;

export const UNAVAILABLE_METRIC = "Backend metric unavailable";
