import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { AndamanTile } from "@/components/cards/AndamanTile";
import { ButtonLink } from "@/components/ui/Button";
import type { AndamanTileItem } from "@/lib/models";

interface AndamanSpotlightProps {
  items: AndamanTileItem[];
  /** Sub-CTA in the closing strip — destination-aware. */
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
}

export function AndamanSpotlight({
  items,
  primaryCtaHref = "/contact?destination=andaman",
  primaryCtaLabel = "Plan my Andaman",
}: AndamanSpotlightProps) {
  if (!items || items.length === 0) return null;
  const [feature, ...rest] = items;
  return (
    <Section tone="navy" pad="loose" className="overflow-hidden">
      <div className="grain absolute inset-0 pointer-events-none" aria-hidden />
      <Container>
        <SectionHeader
          eyebrow="Our signature — Andaman Islands"
          title={
            <>
              Two decades on the islands. <span className="block text-gold/90">It shows in the details.</span>
            </>
          }
          description="The Andamans is not a destination we resell — it is where we run ground operations, train guides, and pour the foundation of every TVV journey. Begin here."
          invert
          viewAllHref="/andaman"
          viewAllLabel="Open the Andaman Hub"
        />

        <div className="grid gap-5 lg:grid-cols-3">
          <AndamanTile item={feature} variant="feature" className="lg:row-span-2 lg:aspect-auto lg:h-full" />
          {rest.map((item) => (
            <AndamanTile key={item.slug} item={item} />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <p className="text-label uppercase text-gold/90">Andaman, designed around you</p>
            <p className="mt-2 font-display text-[20px] leading-snug text-white">
              Tell us how you travel — we'll send a private Andaman proposal within four hours.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={primaryCtaHref} size="md">{primaryCtaLabel}</ButtonLink>
            <ButtonLink href="/ferry" variant="outline-light" size="md">Book a ferry</ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
