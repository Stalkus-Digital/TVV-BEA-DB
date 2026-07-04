import { HeroSection, HeroBackground, HeroBreadcrumb } from "@/components/ui/HeroLayout";
import Image from "next/image";
import { Heart, Sparkles, Lock, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { PackageCard } from "@/components/cards/PackageCard";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { TestimonialStrip } from "@/components/sections/TestimonialStrip";
import { CardRail, CardRailItem } from "@/components/sections/CardRail";
import {
  destinationsService,
  faqsService,
  packagesService,
  reviewsService,
} from "@/lib/services";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata = buildMetadata({
  title: "Honeymoon Escapes — Quiet First Journeys, Curated",
  description:
    "Specialist-planned honeymoon packages in the Andamans, Maldives, Bali, Santorini, Switzerland and more. Private experiences, vetted villas, and a concierge who anticipates everything.",
  path: "/honeymoon",
  keywords: [
    "honeymoon packages",
    "Andaman honeymoon",
    "Maldives honeymoon",
    "Bali honeymoon",
    "luxury honeymoon India",
    "Santorini honeymoon",
  ],
});

export const revalidate = 600;

const promises = [
  { icon: Heart, title: "Designed for two", body: "Couples-only sequencing — quiet stays, private dinners, room to do nothing." },
  { icon: Sparkles, title: "The smallest details, anticipated", body: "Allergies, anniversaries, the wine he likes — quietly handled before you arrive." },
  { icon: Lock, title: "Privacy, by default", body: "Villa-only stays, private transfers, and no group activities unless you ask." },
  { icon: Mail, title: "A specialist for the whole trip", body: "One person you can reach, twenty-four hours a day, for any question." },
];

export default async function HoneymoonPage() {
  const [toursRes, destsRes, reviewsRes, faqsRes] = await Promise.all([
    packagesService.byTheme("honeymoon"),
    destinationsService.list(),
    reviewsService.list(3),
    faqsService.list({ limit: 5 }),
  ]);
  const tours = toursRes.ok ? toursRes.data : [];
  const dests = destsRes.ok
    ? destsRes.data.filter((d) => ["andaman", "maldives", "bali", "switzerland", "kerala", "japan"].includes(d.slug))
    : [];
  const reviews = reviewsRes.ok ? reviewsRes.data : [];
  const faqs = faqsRes.ok ? faqsRes.data : [];

  return (
    <>
      <HeroSection>
        <HeroBackground src="https://images.unsplash.com/photo-1540202404-1b927e27fa8b?auto=format&fit=crop&w=2400&q=85" />
        <Container>
          <HeroBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Honeymoon" }]} />
          <div className="max-w-2xl">
            <p className="text-label uppercase text-gold drop-shadow-md">Honeymoon escapes</p>
            <h1 className="mt-3 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-tight tracking-tight text-balance drop-shadow-lg">
              A quiet beginning. <span className="block text-gold/90">Considered, not curated.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/90 drop-shadow-md">
              Honeymoon journeys designed by people who plan honeymoons every week — not a generic luxury package
              with a couple's photo on it. Private villas, private experiences, and a specialist who knows the
              difference between quiet and empty.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contact?type=honeymoon" size="lg" className="px-7">Plan our honeymoon</ButtonLink>
              <ButtonLink href="#destinations" variant="outline-light" size="lg" className="px-7">Browse destinations</ButtonLink>
            </div>
          </div>
        </Container>
      </HeroSection>

      <Section tone="cream" pad="default">
        <Container>
          <SectionHeader
            eyebrow="The TVV honeymoon promise"
            title="Four things we never compromise on."
            description="These are not pitches — they are operational defaults that apply to every honeymoon we plan."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {promises.map((p) => (
              <div key={p.title} className="rounded-lg border border-line bg-white p-7">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold-light text-gold">
                  <p.icon className="h-4 w-4" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-[18px] text-ink">{p.title}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {dests.length > 0 && (
        <Section tone="white" pad="default" id="destinations">
          <Container>
            <SectionHeader
              eyebrow="Honeymoon destinations"
              title="Six islands and mountains we love sending honeymooners."
              description="Pick a feeling — overwater seclusion, alpine quiet, jungle cliff villas, slow backwaters."
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {dests.map((d, i) => (
                <DestinationCard key={d.slug} destination={d} priority={i < 2} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {tours.length > 0 && (
        <Section tone="cream" pad="default">
          <Container>
            <SectionHeader
              eyebrow="Honeymoon journeys"
              title="Itineraries that have made other people fall in love."
              viewAllHref="/packages/international?theme=honeymoon"
              viewAllLabel="View all"
            />
            <CardRail>
              {tours.map((t) => (
                <CardRailItem key={t.slug}>
                  <PackageCard data={t} />
                </CardRailItem>
              ))}
            </CardRail>
          </Container>
        </Section>
      )}

      <TestimonialStrip reviews={reviews} />

      {faqs.length > 0 && (
        <Section tone="surface" pad="default">
          <Container size="default">
            <SectionHeader eyebrow="Honeymoon FAQs" title="The things couples ask us most." align="center" />
            <div className="mx-auto max-w-3xl divide-y divide-line rounded-lg border border-line bg-white">
              {faqs.map((f, i) => (
                <details key={i} className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-5 px-6 py-5 [&::-webkit-details-marker]:hidden">
                    <h3 className="font-display text-[16px] text-ink">{f.q}</h3>
                    <span aria-hidden className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted transition-transform duration-base group-open:rotate-45">+</span>
                  </summary>
                  <p className="px-6 pb-5 text-[14px] leading-relaxed text-ink-secondary">{f.a}</p>
                </details>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <ConciergeCTA
        eyebrow="Honeymoon concierge"
        title="Ready to plan something you'll both remember?"
        description="Share your dates and the way you'd like to travel — a specialist will design a private proposal within four hours."
        primaryLabel="Plan our honeymoon"
        primaryHref="/contact?type=honeymoon"
      />

      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
    </>
  );
}
