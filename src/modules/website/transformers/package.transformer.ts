import type { Package } from "@/modules/package/types/package";
import type { PackageDayWithItems } from "@/modules/package/types/package-preview";
import type { PackagePricing } from "@/modules/package/types/package-pricing";
import { packageTripTypeLabel } from "@/modules/package/constants/trip-type";
import type { Destination } from "@/modules/destination";
import { buildSeoDTO } from "../seo/seo-builder";
import type {
  WebsitePackageDayDTO,
  WebsitePackageDetailDTO,
  WebsitePackageSummaryDTO,
} from "../dto/website-package.dto";
import type { WebsiteBreadcrumbDTO } from "../dto/website-seo.dto";
import type { WebsiteDestinationSummaryDTO } from "../dto/website-destination.dto";
import { toDestinationSummary } from "./destination.transformer";

function contentImages(pkg: Package): string[] {
  const raw = pkg.content?.images;
  if (!Array.isArray(raw)) return [];
  return raw.filter((url): url is string => typeof url === "string" && url.length > 0);
}

function contentString(pkg: Package, key: "inclusions" | "exclusions" | "rules"): string | null {
  const value = pkg.content?.[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function resolveHeroImage(pkg: Package): string | null {
  return pkg.seo?.ogImageUrl ?? contentImages(pkg)[0] ?? null;
}

/**
 * Pure — no I/O, no service calls. Every piece of data (Package, its
 * Destination, a resolved "from" price) is already fetched by
 * website-package.service.ts before this runs. Never receives or returns
 * the internal Package/PackagePreview entity to a caller outside this
 * module — only these DTOs cross the module boundary via api/.
 */
export function toPackageSummary(
  pkg: Package,
  destination: Destination | null,
  fromPrice: number | null,
  currency: string | null
): WebsitePackageSummaryDTO {
  return {
    id: pkg.id,
    slug: pkg.slug,
    title: pkg.title,
    destinationName: destination?.name ?? "",
    destinationSlug: destination?.slug ?? "",
    durationDays: pkg.durationDays,
    durationNights: pkg.durationNights,
    fromPrice,
    currency,
    heroImage: resolveHeroImage(pkg),
    tripType: pkg.tripType ?? null,
    tripTypeLabel: packageTripTypeLabel(pkg.tripType),
  };
}

export interface PackageDetailInput {
  pkg: Package;
  days: PackageDayWithItems[];
  pricing: PackagePricing | null;
  destination: Destination | null;
  relatedPackages: WebsitePackageSummaryDTO[];
  breadcrumbs: WebsiteBreadcrumbDTO[];
  fromPrice: number | null;
  baseUrl: string;
}

export function toPackageDetail(input: PackageDetailInput): WebsitePackageDetailDTO {
  const summary = toPackageSummary(input.pkg, input.destination, input.fromPrice, input.pricing?.currency ?? null);
  const fromContent = contentImages(input.pkg);
  const fromItems = input.days.flatMap((day) => day.items.flatMap((item) => item.images));
  const seen = new Set<string>();
  const allImages = (fromContent.length > 0 ? fromContent : fromItems).filter((url) => {
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
  const hero = summary.heroImage;
  // Gallery thumbs: remaining images after hero (frontend still prepends hero for display)
  const gallery =
    hero && allImages[0] === hero
      ? allImages.slice(1)
      : allImages.filter((url) => url !== hero);

  const itinerary: WebsitePackageDayDTO[] = input.days
    .sort((a, b) => a.dayNumber - b.dayNumber)
    .map((day) => ({
      dayNumber: day.dayNumber,
      title: day.title,
      description: day.description,
      items: day.items.map((item) => ({
        kind: item.kind,
        title: item.title,
        description: item.description,
        timeOfDay: item.timeOfDay,
        images: item.images,
      })),
    }));

  const destinationSummary: WebsiteDestinationSummaryDTO | null = input.destination
    ? toDestinationSummary(input.destination)
    : null;

  const seo = buildSeoDTO(
    input.baseUrl,
    {
      metaTitle: input.pkg.seo?.metaTitle,
      metaDescription: input.pkg.seo?.metaDescription,
      canonicalUrl: input.pkg.seo?.canonicalUrl,
      ogImageUrl: input.pkg.seo?.ogImageUrl ?? hero ?? undefined,
    },
    {
      title: input.pkg.title,
      description: `${input.pkg.durationDays}D/${input.pkg.durationNights}N package in ${destinationSummary?.name ?? "your destination"}`,
      path: `/package/${input.pkg.slug}`,
    }
  );

  return {
    ...summary,
    itinerary,
    pricing: input.pricing
      ? { currency: input.pricing.currency, basePrice: input.pricing.basePrice, fromPrice: input.fromPrice }
      : null,
    gallery,
    inclusions: contentString(input.pkg, "inclusions"),
    exclusions: contentString(input.pkg, "exclusions"),
    rules: contentString(input.pkg, "rules"),
    faqs: (input.pkg.faqs || []).map((f: any) => ({ question: f.question, answer: f.answer })),
    relatedPackages: input.relatedPackages,
    destinationSummary,
    seo,
    breadcrumbs: input.breadcrumbs,
  };
}
