import { HeroSection, HeroBackground, HeroBreadcrumb } from "@/components/ui/HeroLayout";
import Image from "next/image";
import { Gem, Shield, Users, KeyRound } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { PackageCard } from "@/components/cards/PackageCard";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { CardRail, CardRailItem } from "@/components/sections/CardRail";
import { packagesService } from "@/lib/services";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Luxury Escapes — Quiet, Private, Considered",
  description:
    "TVV's luxury portfolio: private villas, butlered estates, exclusive partner properties. Aman, Soneva, Taj, Bulgari, Cheval Blanc — and a few that aren't on the brochures.",
  path: "/luxury",
  keywords: [
    "luxury holiday packages",
    "private villa rental India",
    "Aman tour",
    "Soneva package",
    "luxury Maldives package",
    "exclusive travel India",
  ],
});

export const revalidate = 600;

const partners = [
  "Aman Resorts", "Soneva", "Taj Exotica", "Six Senses", "Bulgari Hotels",
  "Cheval Blanc", "Belmond", "Mandarin Oriental", "Rosewood", "&Beyond",
];

const values = [
  { icon: Gem, title: "Vetted properties only", body: "Every villa, estate, and ryokan in our portfolio has been visited by our team. We don't list what we wouldn't book ourselves." },
  { icon: KeyRound, title: "Private by default", body: "Private transfers, private guides, private villas. No coach tours, no group dinners, no shared experiences unless you ask." },
  { icon: Shield, title: "Discreet concierge", body: "A specialist who anticipates rather than asks. The smallest details — handled, never mentioned." },
  { icon: Users, title: "Partner upgrades", body: "Through our partner network: complimentary upgrades, late check-outs, in-villa breakfasts, and access to closed-door restaurants." },
];

export default async function LuxuryPage() {
  const [luxuryRes, allRes] = await Promise.all([
    packagesService.byTheme("luxury"),
    packagesService.list(),
  ]);
  const tours = luxuryRes.ok && luxuryRes.data.length > 0
    ? luxuryRes.data
    : (allRes.ok ? allRes.data.filter((p) => p.pricing.perAdult > 200000) : []);

  return (
    <>
      <HeroSection>
        <HeroBackground src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=2400&q=85" />
        <Container>
          <HeroBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Luxury Escapes" }]} />
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-pill border border-gold/30 bg-gold/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-gold drop-shadow-md">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gold" aria-hidden /> Exclusive
            </span>
            <h1 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-tight tracking-tight text-balance drop-shadow-lg">
              Luxury without performance.
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/90 drop-shadow-md">
              Service that's felt, not announced. Properties chosen for the quality of their morning light, not
              the number of stars on their website. A small portfolio, vetted obsessively.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contact?type=luxury" size="lg" className="px-7">Request a private consultation</ButtonLink>
              <ButtonLink href="#partners" variant="outline-light" size="lg" className="px-7">Our partner brands</ButtonLink>
            </div>
          </div>
        </Container>
      </HeroSection>

      <Section tone="gold-light" pad="default">
        <Container>
          <SectionHeader eyebrow="The luxury standard" title="Four things every luxury journey runs on." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-lg border border-gold/30 bg-white p-7">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold text-navy">
                  <v.icon className="h-4 w-4" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-[18px] text-ink">{v.title}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary">{v.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {tours.length > 0 && (
        <Section tone="cream" pad="default">
          <Container>
            <SectionHeader
              eyebrow="Luxury journeys"
              title="A working shelf, refreshed quarterly."
              description="Every itinerary is a starting point. Yours will be reshaped — pace, party size, and the properties that match how you actually want to travel."
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

      <Section tone="white" pad="default" id="partners">
        <Container>
          <SectionHeader
            eyebrow="Partner brands"
            title="A short list. Carefully chosen."
            align="center"
            description="The brands we book most often. We work with many more — these are the ones our specialists know best."
          />
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-5">
            {partners.map((p) => (
              <p key={p} className="font-display text-[15px] text-ink-secondary text-center">{p}</p>
            ))}
          </div>
        </Container>
      </Section>

      <ConciergeCTA
        eyebrow="Luxury concierge"
        title="Ready for a private consultation?"
        description="A senior specialist will call within 24 hours — no obligation, no script. Bring your dates, your party, and the way you'd like to travel."
        primaryLabel="Request a consultation"
        primaryHref="/contact?type=luxury"
        secondaryLabel="See our exclusive partners"
        secondaryHref="#partners"
      />
    </>
  );
}
