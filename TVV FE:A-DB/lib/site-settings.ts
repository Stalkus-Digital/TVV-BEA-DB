/**
 * Server-side loader for site-wide settings.
 *
 * Fetches the singleton `SiteSettings` document from the backend and merges
 * it with the static `SITE` constant so any field the admin hasn't filled in
 * falls back to a sane default. Uses Next.js fetch caching with a 60s
 * revalidation window — admin saves take effect within a minute without
 * forcing a rebuild.
 *
 * Use from server components only. Client components receive the merged
 * SiteSettings as a prop.
 */

import { fetchSiteSettings, type SiteSettingsPayload } from "@/lib/api/website";
import { SITE } from "@/lib/seo";

export interface SiteSettings {
  name: string;
  shortName: string;
  url: string;
  tagline: string;
  description: string;
  logoUrl?: string | null;
  ogImage?: string | null;
  twitter?: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  bookingEmail: string;
  address: {
    line1: string;
    line2: string;
    short: string;
  };
  hours: {
    weekdays: string;
    sunday: string;
    short: string;
  };
  socialLinks: { platform: string; url: string; label?: string | null }[];
  footerTagline: string;
  footerCopyright: string;
}

const FALLBACK: SiteSettings = {
  name: SITE.name,
  shortName: SITE.shortName,
  url: SITE.url,
  tagline: SITE.tagline,
  description: SITE.description,
  logoUrl: null,
  ogImage: SITE.ogImage,
  twitter: SITE.twitter,
  phone: SITE.phone,
  whatsapp: SITE.whatsapp,
  email: SITE.email,
  bookingEmail: SITE.email,
  address: { line1: "", line2: "", short: "" },
  hours: { weekdays: "Mon–Sat, 9am–7pm IST", sunday: "Closed", short: "Mon–Sat 9–7 IST" },
  socialLinks: [],
  footerTagline: SITE.description,
  footerCopyright: `© ${new Date().getFullYear()} ${SITE.name}. All rights reserved.`,
};

export async function loadSiteSettings(): Promise<SiteSettings> {
  try {
    const data = await fetchSiteSettings();
    return mergeSettings(data ?? {});
  } catch {
    return FALLBACK;
  }
}

function mergeSettings(input: SiteSettingsPayload): SiteSettings {
  return {
    name: input.name || FALLBACK.name,
    shortName: input.shortName || FALLBACK.shortName,
    url: input.url || FALLBACK.url,
    tagline: input.tagline || FALLBACK.tagline,
    description: input.description || FALLBACK.description,
    logoUrl: input.logoUrl ?? FALLBACK.logoUrl,
    ogImage: input.ogImage ?? FALLBACK.ogImage,
    twitter: input.twitter ?? FALLBACK.twitter,
    phone: input.phone || FALLBACK.phone,
    whatsapp: input.whatsapp || FALLBACK.whatsapp,
    email: input.email || FALLBACK.email,
    bookingEmail: input.bookingEmail || FALLBACK.bookingEmail,
    address: {
      line1: input.address?.line1 || FALLBACK.address.line1,
      line2: input.address?.line2 || FALLBACK.address.line2,
      short: input.address?.short || FALLBACK.address.short,
    },
    hours: {
      weekdays: input.hours?.weekdays || FALLBACK.hours.weekdays,
      sunday: input.hours?.sunday || FALLBACK.hours.sunday,
      short: input.hours?.short || FALLBACK.hours.short,
    },
    socialLinks: input.socialLinks ?? FALLBACK.socialLinks,
    footerTagline: input.footerTagline || FALLBACK.footerTagline,
    footerCopyright: input.footerCopyright || FALLBACK.footerCopyright,
  };
}
