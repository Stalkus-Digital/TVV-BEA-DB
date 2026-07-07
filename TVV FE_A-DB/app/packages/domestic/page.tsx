import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { HeroSection, HeroBackground, HeroBreadcrumb } from "@/components/ui/HeroLayout";
import { PackageFiltersListing } from "@/components/sections/PackageFiltersListing";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { TrustBar } from "@/components/sections/TrustBar";
import { JsonLd } from "@/components/ui/JsonLd";
import { reviewsService } from "@/lib/services";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "India Tour Packages — Curated Domestic Journeys",
  description:
    "Curated India tour packages — Kerala, Rajasthan, Ladakh, Himachal, Kashmir, Andaman, Sikkim. Specialist-planned, fully customisable, with 24/7 concierge.",
  path: "/packages/domestic",
  keywords: [
    "India tour packages",
    "domestic holiday packages",
    "Kerala tour package",
    "Rajasthan tour package",
    "Ladakh tour package",
    "Andaman package India",
    "luxury India tour",
  ],
});

export const revalidate = 300;

export default async function DomesticListingPage() {
  const trustRes = await reviewsService.trustStats();

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Packages", href: "/packages/domestic" },
    { label: "India tour packages" },
  ];

  return (
    <>
      <HeroSection>
        <HeroBackground src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2400&q=85" />
        <Container>
          <HeroBreadcrumb items={breadcrumbs} />
          <div className="max-w-2xl">
            <p className="text-label uppercase text-gold drop-shadow-md">Domestic</p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-balance drop-shadow-lg">
              India, the way our specialists travel it.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/90 text-pretty drop-shadow-md">
              Curated India journeys — from a 5-night Andaman classic to a 9-day Ladakh circuit. Filter by location,
              trip type, and duration to find the right starting point.
            </p>
          </div>
        </Container>
      </HeroSection>

      <TrustBar stats={trustRes.ok ? trustRes.data : []} />

      <section className="bg-cream pb-section pt-12">
        <Container>
          <PackageFiltersListing />
        </Container>
      </section>

      <section className="bg-white py-section">
        <Container size="default">
          <h2 className="font-display text-[26px] text-ink">About our India tour packages</h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-secondary">
            <p>
              The Vacation Voice has been designing India journeys for over fifteen years. We work across
              eight states with vetted ground partners and our own teams in the Andamans, Kerala, and Rajasthan.
              Every package on this page is a real, working itinerary — sequenced for travel pace, not for sales.
            </p>
            <p>
              Most travellers use these itineraries as a starting point. A specialist will adjust the route to
              your dates, add or remove cities, and recommend properties that match how you actually want to
              travel: a converted heritage haveli in Jodhpur, a houseboat in Alleppey, or a beachfront villa in
              Havelock. Domestic flights, transfers, and experiences are built into each proposal.
            </p>
            <p>
              Our concierge is reachable through your trip — every TVV traveller has a specialist on WhatsApp,
              twenty-four hours, seven days, in case the smallest thing needs solving.
            </p>
          </div>
        </Container>
      </section>

      <ConciergeCTA
        title="Looking for something more specific?"
        description="Tell a specialist what you have in mind — heritage, slow travel, family, mountains. We'll send a written proposal within four hours."
      />

      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs.map((b) => ({ name: b.label, url: b.href ?? "/packages/domestic" })),
        )}
      />
    </>
  );
}
