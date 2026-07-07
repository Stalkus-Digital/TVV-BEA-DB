import type { Metadata } from "next";

export const SITE = {
  name: "The Vacation Voice",
  shortName: "TVV",
  url: "https://thevacationvoice.com",
  tagline: "Curated Global Journeys Powered by Andaman Experts",
  description:
    "The Vacation Voice designs specialist-led journeys to the Andaman Islands and 65+ destinations worldwide. Editorial planning, vetted stays, 24/7 concierge.",
  twitter: "@thevacationvoice",
  ogImage: "/og-default.jpg",
  phone: "+91 9123 456 789",
  whatsapp: "919123456789",
  email: "hello@thevacationvoice.com",
} as const;

export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  keywords,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  const url = `${SITE.url}${path}`;
  const fullTitle = title.includes(SITE.name) ? title : `${title} · ${SITE.name}`;
  return {
    title: fullTitle,
    description,
    keywords,
    metadataBase: new URL(SITE.url),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: fullTitle,
      description,
      siteName: SITE.name,
      images: [{ url: image ?? SITE.ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image ?? SITE.ogImage],
      creator: SITE.twitter,
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/logo.svg`,
    description: SITE.description,
    sameAs: [
      "https://instagram.com/thevacationvoice",
      "https://facebook.com/thevacationvoice",
      "https://linkedin.com/company/thevacationvoice",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phone,
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  };
}

export function tourJsonLd(t: {
  title: string;
  description: string;
  image: string;
  priceCurrent: number;
  durationDays: number;
  destination: string;
  slug: string;
  rating: number;
  ratingCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: t.title,
    description: t.description,
    image: t.image,
    touristType: "leisure",
    itinerary: { "@type": "ItemList", name: t.destination },
    offers: {
      "@type": "Offer",
      price: t.priceCurrent,
      priceCurrency: "INR",
      url: `${SITE.url}/packages/${t.slug}`,
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: t.rating,
      reviewCount: t.ratingCount,
    },
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.url}`,
    })),
  };
}
