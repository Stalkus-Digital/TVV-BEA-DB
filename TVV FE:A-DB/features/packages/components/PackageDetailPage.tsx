import { notFound } from "next/navigation";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { Stars } from "@/components/ui/Stars";
import type { FAQ } from "@/lib/models";
import type { Review } from "@/lib/models/review";
import type { Package } from "@/lib/models";
import { faqsService, reviewsService } from "@/lib/services";
import { breadcrumbJsonLd, faqJsonLd, tourJsonLd } from "@/lib/seo";
import { PackageGallery } from "./PackageGallery";
import { PackageInclusions } from "./PackageInclusions";
import { PackageItinerary } from "./PackageItinerary";
import { PackageMobileCta } from "./PackageMobileCta";
import { PackageOverviewBody, PackageOverviewHeader } from "./PackageOverview";
import { PackagePriceCard } from "./PackagePriceCard";
import { RelatedPackagesRail } from "./RelatedPackagesRail";
import { packagesFeatureService } from "../services/packages.feature.service";
import { packageDetailPath, packageListingPath } from "../paths";
import {
  DEFAULT_EXCLUSIONS,
  DEFAULT_INCLUSIONS,
  resolveItinerary,
} from "../utils/itinerary";

interface PackageDetailPageProps {
  slug: string;
}

export async function PackageDetailPage({ slug }: PackageDetailPageProps) {
  const [pkgRes, faqRes] = await Promise.all([
    packagesFeatureService.getBySlug(slug),
    faqsService.list(),
  ]);

  if (!pkgRes.ok) notFound();
  const pkg = pkgRes.data;
  if (!pkg) notFound();

  const [relatedRes, reviewsRes] = await Promise.all([
    packagesFeatureService.getRelated(pkg.slug, 6),
    reviewsService.forTour(pkg.slug, 2),
  ]);

  const similar = relatedRes.ok ? relatedRes.data : [];
  const reviews: Review[] = reviewsRes.ok ? reviewsRes.data : [];
  const faqs: FAQ[] = faqRes.ok ? faqRes.data : [];

  const itineraryDays = resolveItinerary(pkg.itinerary, pkg.destinations, pkg.highlights);
  const inclusions = pkg.inclusions ?? DEFAULT_INCLUSIONS;
  const exclusions = pkg.exclusions ?? DEFAULT_EXCLUSIONS;

  const breadcrumbs = buildBreadcrumbs(pkg);
  const galleryImages = [
    pkg.hero.image,
    ...(pkg.hero.gallery?.map((asset) => asset.url) ?? []),
  ].filter(Boolean);

  return (
    <>
      <section className="bg-cream pb-12 pt-28 lg:pb-24 lg:pt-32">
        <Container>
          <Breadcrumb items={breadcrumbs} />
          <div className="mt-8 lg:mt-12">
            <PackageGallery alt={pkg.title} images={galleryImages} />
          </div>

          <div className="mt-12 grid gap-12 lg:mt-20 lg:grid-cols-[1.6fr,1fr] xl:grid-cols-[1.8fr,1fr]">
            <PackageOverviewHeader pkg={pkg} />
            <div className="hidden lg:sticky lg:top-32 lg:block lg:self-start">
              <PackagePriceCard packageSlug={pkg.slug} packageTitle={pkg.title} pricing={pkg.pricing} />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-cream pb-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.6fr,1fr] xl:grid-cols-[1.8fr,1fr]">
            <div className="space-y-24">
              <PackageOverviewBody pkg={pkg} />

              <section id="itinerary">
                <div className="flex items-end justify-between gap-4 border-b border-line/40 pb-4">
                  <h2 className="font-display text-[32px] text-ink">Day-by-day itinerary</h2>
                  <p className="text-[12px] font-medium uppercase tracking-widest text-ink-muted">Fully customisable</p>
                </div>
                <PackageItinerary days={itineraryDays} />
              </section>

              <PackageInclusions
                inclusions={inclusions}
                exclusions={exclusions}
                cancellationPolicy={pkg.policy?.cancellation}
              />

              {reviews.length > 0 && <PackageReviews reviews={reviews} />}

              {faqs.length > 0 && <PackageFaqs faqs={faqs.slice(0, 4)} />}
            </div>
            <div className="hidden lg:block" aria-hidden />
          </div>
        </Container>
      </section>

      <RelatedPackagesRail packages={similar} region={pkg.region} />

      <ConciergeCTA
        title="Want this journey, but in your own shape?"
        description="A specialist will rebuild this itinerary around your dates, party size, and pace. Same care, same shelf — your route."
      />

      <PackageMobileCta slug={pkg.slug} pricePerAdult={pkg.pricing.perAdult} />

      <JsonLd
        data={[
          tourJsonLd({
            title: pkg.title,
            description:
              pkg.description ??
              `${pkg.title}. ${pkg.durationDays} days, ${pkg.durationNights} nights through ${pkg.destination}.`,
            image: pkg.hero.image,
            priceCurrent: pkg.pricing.perAdult,
            durationDays: pkg.durationDays,
            destination: pkg.destination,
            slug: pkg.slug,
            rating: pkg.rating ?? 4.8,
            ratingCount: pkg.ratingCount ?? 0,
          }),
          breadcrumbJsonLd(
            breadcrumbs.map((item) => ({
              name: item.label,
              url: item.href ?? packageDetailPath(pkg.slug),
            })),
          ),
          ...(faqs.length > 0 ? [faqJsonLd(faqs.slice(0, 4))] : []),
        ]}
      />
    </>
  );
}

function buildBreadcrumbs(pkg: Package) {
  return [
    { label: "Home", href: "/" },
    { label: "Packages", href: packageListingPath(pkg.region) },
    {
      label: pkg.destination,
      href: `/destinations/${pkg.destination.toLowerCase().replace(/\s+/g, "-")}`,
    },
    { label: pkg.title },
  ];
}

function PackageReviews({ reviews }: { reviews: Review[] }) {
  return (
    <section>
      <h2 className="font-display text-[32px] text-ink">Travellers on this journey</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {reviews.map((review) => (
          <figure
            key={review.name}
            className="flex flex-col rounded-xl border border-line/40 bg-white p-8 shadow-card"
          >
            <Stars value={review.rating} />
            <p className="mt-5 font-display text-[20px] leading-snug text-ink">{review.title}</p>
            <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-secondary">
              &ldquo;{review.body}&rdquo;
            </blockquote>
            <figcaption className="mt-6 border-t border-line/40 pt-4 text-[12px] font-medium tracking-wide text-ink-muted">
              {review.name} · {review.location} · {review.date}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function PackageFaqs({ faqs }: { faqs: FAQ[] }) {
  return (
    <section>
      <h2 className="font-display text-[32px] text-ink">Common questions</h2>
      <div className="mt-8 border-t border-line/40">
        {faqs.map((faq, index) => (
          <details key={index} className="group border-b border-line/40 transition-colors hover:bg-white/40">
            <summary className="flex cursor-pointer items-start justify-between gap-6 px-2 py-6 lg:px-4 [&::-webkit-details-marker]:hidden">
              <h3 className="font-display text-[18px] text-ink">{faq.q}</h3>
              <span
                aria-hidden
                className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line/60 text-[18px] leading-none text-ink-muted transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-2 pb-8 pt-2 text-[15px] leading-relaxed text-ink-secondary lg:px-4">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
