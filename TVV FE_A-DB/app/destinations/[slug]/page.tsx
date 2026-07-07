import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { HeroSection, HeroBackground, HeroBreadcrumb } from "@/components/ui/HeroLayout";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { PackageCard } from "@/components/cards/PackageCard";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { JsonLd } from "@/components/ui/JsonLd";
import { CardRail, CardRailItem } from "@/components/sections/CardRail";
import { StickyCTA } from "@/components/ui/StickyCTA";
import { FadeUp, FadeUpItem } from "@/components/ui/FadeUp";
import { destinationsService, packagesService } from "@/lib/services";
import { destinationStaticSlugs } from "@/lib/ssg/static-paths";
import { buildMetadata, breadcrumbJsonLd, SITE } from "@/lib/seo";
import { formatPriceShort } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await destinationStaticSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await destinationsService.getBySlug(slug);
  if (!res.ok || !res.data) {
    return buildMetadata({ title: "Destination not found", description: "", path: `/destinations/${slug}` });
  }
  const d = res.data;
  return buildMetadata({
    title: `${d.name} Tour Packages — Curated by TVV`,
    description: `Specialist-planned ${d.name} tour packages from ${formatPriceShort(d.startsFrom)}. ${d.tagline}. Editorial itineraries, vetted stays, 24/7 concierge.`,
    path: `/destinations/${d.slug}`,
    image: d.image,
    keywords: [`${d.name} tour package`, `${d.name} holiday`, `luxury ${d.name}`, `${d.name} honeymoon`],
  });
}

export const revalidate = 600;

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "andaman") redirect("/andaman");

  const destRes = await destinationsService.getBySlug(slug);
  if (!destRes.ok || !destRes.data) notFound();
  const dest = destRes.data;

  const [exactRes, regionRes] = await Promise.all([
    packagesService.list({ destination: dest.name }),
    packagesService.byRegion(dest.region, 6),
  ]);
  const exact = exactRes.ok ? exactRes.data : [];
  const tours = exact.length > 0 ? exact : (regionRes.ok ? regionRes.data : []);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    {
      label: dest.region === "international" ? "International" : "Domestic",
      href: dest.region === "international" ? "/packages/international" : "/packages/domestic",
    },
    { label: dest.name },
  ];

  return (
    <>
      <StickyCTA label={`Plan my ${dest.name}`} href={`/contact?destination=${dest.slug}`} />
      
      <HeroSection tall>
        <HeroBackground src={dest.heroImage ?? dest.image} />
        <Container>
          <HeroBreadcrumb items={breadcrumbs} absolute />
          <FadeUp stagger delay={0.2} className="max-w-3xl">
            <FadeUpItem>
              <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-gold drop-shadow-md">{dest.continent ?? "Destination"}</p>
            </FadeUpItem>
            <FadeUpItem>
              <h1 className="mt-4 font-display text-[clamp(3rem,8vw,6rem)] leading-[0.95] tracking-tight text-balance drop-shadow-lg">
                {dest.name}.
              </h1>
            </FadeUpItem>
            <FadeUpItem>
              <p className="mt-8 max-w-xl text-[18px] leading-relaxed text-white/90 text-pretty drop-shadow-md">
                Our specialists know {dest.name} well — its hidden afternoons, its overrated postcards, and the
                properties worth the splurge. Below: a working shelf of journeys, plus a way to design your own.
              </p>
            </FadeUpItem>
            <FadeUpItem>
              <p className="mt-8 inline-flex items-center gap-2 text-[12px] uppercase tracking-widest text-white/80 drop-shadow-md">
                Curated journeys from <span className="font-medium text-gold">{formatPriceShort(dest.startsFrom)}</span> per adult
              </p>
            </FadeUpItem>
          </FadeUp>
        </Container>
      </HeroSection>

      <Section tone="cream" className="py-24 lg:py-32">
        <Container>
          <SectionHeader
            eyebrow={`${dest.name} journeys`}
            title={`${tours.length} curated route${tours.length === 1 ? "" : "s"} through ${dest.name}.`}
            description="Each itinerary is a starting point — yours will be rebuilt around how you travel."
            viewAllHref={dest.region === "international" ? "/packages/international" : "/packages/domestic"}
            viewAllLabel="Browse all"
          />
          <div className="mt-16">
            <CardRail>
              {tours.map((t) => (
                <CardRailItem key={t.slug}>
                  <PackageCard data={t} />
                </CardRailItem>
              ))}
            </CardRail>
          </div>
        </Container>
      </Section>

      <ConciergeCTA
        title={`Looking for a more specific ${dest.name} trip?`}
        description="Tell us your dates and your pace — a written proposal lands in your inbox within four hours."
      />

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs.map((b) => ({ name: b.label, url: b.href ?? `/destinations/${dest.slug}` }))),
          {
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            name: dest.name,
            description: dest.tagline,
            url: `${SITE.url}/destinations/${dest.slug}`,
          },
        ]}
      />
    </>
  );
}
