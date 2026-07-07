import { HeroSection, HeroBackground, HeroBreadcrumb } from "@/components/ui/HeroLayout";
import Image from "next/image";
import { ArrowRight, Anchor, MapPin, Compass } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { PackageCard } from "@/components/cards/PackageCard";
import { AndamanTile } from "@/components/cards/AndamanTile";
import { ExperienceCard } from "@/components/cards/ExperienceCard";
import { ReelCard } from "@/components/cards/ReelCard";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { TestimonialStrip } from "@/components/sections/TestimonialStrip";
import { JsonLd } from "@/components/ui/JsonLd";
import { CardRail, CardRailItem } from "@/components/sections/CardRail";
import {
  experiencesService,
  faqsService,
  guidesService,
  packagesService,
  reviewsService,
} from "@/lib/services";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, SITE } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Andaman Islands — Curated Journeys by TVV Specialists",
  description:
    "Plan your Andaman Islands trip with the specialists who run their own ground operations in Port Blair. Itineraries, honeymoon escapes, ferries, scuba, luxury stays — all in one place.",
  path: "/andaman",
  keywords: [
    "Andaman tour packages",
    "Andaman honeymoon package",
    "Havelock island package",
    "Andaman ferry booking",
    "Andaman scuba diving",
    "Andaman luxury resort",
    "Port Blair package",
    "Neil island itinerary",
  ],
});

export const revalidate = 600;

const islands = [
  { name: "Port Blair", note: "Gateway · cellular history", image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=1200&q=80" },
  { name: "Havelock", note: "Radhanagar · world's best beach", image: "https://images.unsplash.com/photo-1540202404-1b927e27fa8b?auto=format&fit=crop&w=1200&q=80" },
  { name: "Neil", note: "Bharatpur · slow afternoons", image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80" },
  { name: "Ross & Smith", note: "Twin islands · sandbar walk", image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1200&q=80" },
  { name: "Baratang", note: "Mud volcanoes · limestone caves", image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80" },
  { name: "Long Island", note: "Untouched · long stays only", image: "https://images.unsplash.com/photo-1540202404-1b927e27fa8b?auto=format&fit=crop&w=1200&q=80" },
];

const seasons = [
  { months: "Oct – Feb", title: "Peak", note: "Calm seas, clear visibility, every ferry runs.", tone: "from-teal/15 to-transparent" },
  { months: "Mar – May", title: "Shoulder", note: "Warmer, fewer crowds, best for divers.", tone: "from-gold/15 to-transparent" },
  { months: "Jun – Sep", title: "Monsoon", note: "Atmospheric, quieter resorts, occasional ferry pauses.", tone: "from-info/10 to-transparent" },
];

const planSteps = [
  { icon: MapPin, title: "Tell us your dates & style", body: "A 10-minute call (or a form) to understand pace, party size, and the moments you'd remember." },
  { icon: Compass, title: "Receive a private itinerary", body: "Within four hours, a written proposal — island sequence, stays, transfers, experiences." },
  { icon: Anchor, title: "Travel with a specialist on-call", body: "Confirmed ferries, vetted properties, and a specialist reachable 24/7 through the trip." },
];

export default async function AndamanHubPage() {
  const [
    andamanRes,
    domesticRes,
    spotlightRes,
    experiencesRes,
    reelsRes,
    reviewsRes,
    faqsRes,
  ] = await Promise.all([
    packagesService.byRegion("andaman"),
    packagesService.byRegion("domestic"),
    guidesService.andamanSpotlight(),
    experiencesService.list({ scope: "andaman" }),
    guidesService.reels(),
    reviewsService.list(3),
    faqsService.list(),
  ]);

  const andamanTours = andamanRes.ok ? andamanRes.data : [];
  const fillerTours = domesticRes.ok ? domesticRes.data.slice(0, 3) : [];
  const spotlight = spotlightRes.ok ? spotlightRes.data : [];
  const experiences = experiencesRes.ok
    ? experiencesRes.data.filter((e) => ["scuba-diving", "honeymoon", "luxury", "family"].includes(e.slug))
    : [];
  const reels = reelsRes.ok ? reelsRes.data : [];
  const reviews = reviewsRes.ok ? reviewsRes.data : [];
  const faqs = faqsRes.ok ? faqsRes.data : [];

  const andamanFaqs = faqs.filter((f) => /andaman|ferry/i.test(f.q) || /andaman|ferry/i.test(f.a));
  const moreFaqs = faqs.filter((f) => !andamanFaqs.includes(f)).slice(0, 3);
  const finalFaqs = [...andamanFaqs, ...moreFaqs];

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Andaman Islands" },
  ];

  return (
    <>
      <HeroSection>
        <HeroBackground src="https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=2400&q=85" />

        <Container>
          <HeroBreadcrumb items={breadcrumbs} />
          <div className="max-w-3xl">
            <p className="text-label uppercase text-gold drop-shadow-md">TVV signature · Since 2008</p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02] tracking-tight text-balance drop-shadow-lg">
              The Andamans, the way <span className="text-gold/90">we know them.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/90 text-pretty drop-shadow-md">
              We run our own ground operations across Port Blair, Havelock, and Neil — which means
              your ferries are confirmed, your villas are vetted, and your specialist is reachable when
              the network drops. This is our home shelf.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contact?destination=andaman" size="lg" className="px-7">
                Plan My Andaman Journey <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/packages/domestic/andaman" variant="outline-light" size="lg" className="px-7">
                Browse {andamanTours.length} itineraries
              </ButtonLink>
            </div>

            <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
              {[
                { v: "16+", l: "Years in Andaman" },
                { v: "6", l: "Islands covered" },
                { v: "180+", l: "Vetted properties" },
                { v: "24/7", l: "Ground concierge" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-display text-[26px] font-bold text-white drop-shadow-md">{s.v}</dt>
                  <dd className="text-[12px] text-white/80 drop-shadow-md">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </HeroSection>

      {spotlight.length > 0 && (
        <Section tone="cream" pad="default">
          <Container>
            <SectionHeader
              eyebrow="Where to begin"
              title="Six doors into the Andamans."
              description="Pick a thread — ferries, scuba, honeymoon, island hopping. Each opens onto a private specialist."
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {spotlight.map((s) => (
                <AndamanTile key={s.slug} item={s} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section tone="white" pad="default">
        <Container>
          <SectionHeader
            eyebrow="Andaman itineraries"
            title="Quietly considered routes, fully customisable."
            description="Every published itinerary is a starting point — a specialist will rebuild any one of them around your dates and pace."
            viewAllHref="/packages/domestic/andaman"
            viewAllLabel="See all"
          />
          <CardRail>
            {[...andamanTours, ...(andamanTours.length < 3 ? fillerTours : [])].map((t) => (
              <CardRailItem key={t.slug}>
                <PackageCard data={t} />
              </CardRailItem>
            ))}
          </CardRail>
        </Container>
      </Section>

      <Section tone="surface" pad="default" id="islands">
        <Container>
          <SectionHeader
            eyebrow="The archipelago"
            title="Six islands, six different days."
            description="Each island has its own pace and personality. Our specialists sequence them around how you travel — not around what's easiest to sell."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {islands.map((island) => (
              <article key={island.name} className="group relative overflow-hidden rounded-lg bg-white border border-line shadow-card">
                <div className="relative aspect-[5/3] overflow-hidden">
                  <Image
                    src={island.image}
                    alt={island.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover transition-transform duration-[700ms] ease-premium group-hover:scale-[1.04]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-[20px] text-ink">{island.name}</h3>
                  <p className="mt-1 text-[13px] text-ink-secondary">{island.note}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {experiences.length > 0 && (
        <Section tone="cream" pad="default">
          <Container>
            <SectionHeader
              eyebrow="Andaman experiences"
              title="Beyond the beach photograph."
              description="From beginner dives at Elephant Beach to private dinners on Radhanagar's edge — the experiences that turn a beach trip into a story."
              viewAllHref="/experiences?destination=andaman"
              viewAllLabel="All experiences"
            />
            <div className="-mx-5 flex gap-5 overflow-x-auto scroll-rail px-5 pb-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
              {experiences.map((e) => (
                <div key={e.slug} className="w-[270px] shrink-0 sm:w-auto">
                  <ExperienceCard experience={e} />
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section tone="white" pad="default">
        <Container>
          <SectionHeader
            eyebrow="When to go"
            title="Six microseasons — three big windows."
            description="A field-tested view of the Andaman calendar. Our specialists will tell you which weeks within each window are actually the best."
            viewAllHref="/guides/andaman-best-time-to-visit"
            viewAllLabel="Read the full guide"
          />
          <div className="grid gap-5 sm:grid-cols-3">
            {seasons.map((season) => (
              <div key={season.title} className="relative overflow-hidden rounded-lg border border-line bg-white p-7">
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${season.tone}`} />
                <div className="relative">
                  <p className="text-label uppercase text-teal">{season.months}</p>
                  <p className="mt-3 font-display text-[24px] text-ink">{season.title}</p>
                  <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary">{season.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="gold-light" pad="default" id="story">
        <Container>
          <SectionHeader
            eyebrow="The TVV way"
            title="How we plan an Andaman journey."
            description="No call-centres, no template proposals. A small team, a written brief, and four hours."
          />
          <ol className="grid gap-5 sm:grid-cols-3">
            {planSteps.map((step, i) => (
              <li key={step.title} className="relative rounded-lg border border-gold/30 bg-white p-7">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold text-navy">
                  <step.icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="mt-5 text-label uppercase text-ink-muted">Step {i + 1}</p>
                <h3 className="mt-1 font-display text-[20px] text-ink">{step.title}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {reels.length > 0 && (
        <Section tone="navy" pad="default" className="overflow-hidden">
          <div className="grain absolute inset-0 pointer-events-none" aria-hidden />
          <Container>
            <SectionHeader
              eyebrow="Andaman in motion"
              title="Sixty seconds, somewhere worth seeing."
              description="Unedited moments from the islands — captured by our specialists, our travellers, and our partners."
              invert
            />
            <div className="-mx-5 flex gap-4 overflow-x-auto scroll-rail scroll-snap-x px-5 pb-3 sm:mx-0 sm:gap-5 sm:px-0">
              {reels
                .slice()
                .sort((a, b) => (a.destination === "Andaman" ? -1 : 1) - (b.destination === "Andaman" ? -1 : 1))
                .slice(0, 6)
                .map((r) => (
                  <div key={r.slug} className="w-[210px] shrink-0 scroll-snap-start">
                    <ReelCard reel={r} />
                  </div>
                ))}
            </div>
          </Container>
        </Section>
      )}

      <TestimonialStrip reviews={reviews} />

      {finalFaqs.length > 0 && (
        <Section tone="cream" pad="default">
          <Container size="default">
            <SectionHeader
              eyebrow="Andaman FAQs"
              title="The things travellers actually ask us."
              description="If a question isn't answered here, ask your specialist — they reply within four hours."
              align="center"
            />
            <div className="mx-auto max-w-3xl divide-y divide-line rounded-lg border border-line bg-white">
              {finalFaqs.map((faq, i) => (
                <details key={i} className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-5 px-6 py-5 [&::-webkit-details-marker]:hidden">
                    <h3 className="font-display text-[17px] text-ink">{faq.q}</h3>
                    <span aria-hidden className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted transition-transform duration-base group-open:rotate-45">+</span>
                  </summary>
                  <p className="px-6 pb-6 text-[14px] leading-relaxed text-ink-secondary">{faq.a}</p>
                </details>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <ConciergeCTA
        eyebrow="Andaman concierge"
        title="Ready to plan an Andaman journey you'll keep talking about?"
        description="Tell us when you'd like to travel and how you like to travel. A specialist will send a private proposal — usually within four hours."
        primaryLabel="Plan My Andaman"
        primaryHref="/contact?destination=andaman"
        secondaryLabel="Book a ferry instead"
        secondaryHref="/ferry"
      />

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs.map((b) => ({ name: b.label, url: b.href ?? "/andaman" }))),
          ...(finalFaqs.length > 0 ? [faqJsonLd(finalFaqs)] : []),
          {
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            name: "Andaman Islands",
            url: `${SITE.url}/andaman`,
            description: "TVV is a specialist Andaman travel house running ground operations across Port Blair, Havelock and Neil.",
          },
        ]}
      />
    </>
  );
}
