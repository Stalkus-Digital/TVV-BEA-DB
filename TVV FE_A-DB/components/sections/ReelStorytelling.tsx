import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ReelCard } from "@/components/cards/ReelCard";
import type { Reel } from "@/lib/models";

interface ReelStorytellingProps {
  reels: Reel[];
}

export function ReelStorytelling({ reels }: ReelStorytellingProps) {
  if (!reels || reels.length === 0) return null;
  return (
    <Section tone="navy" pad="default" className="overflow-hidden">
      <div className="grain absolute inset-0 pointer-events-none" aria-hidden />
      <Container>
        <SectionHeader
          eyebrow="Reels from the road"
          title="Sixty seconds, somewhere worth seeing."
          description="Unedited moments from our specialists, our travellers, and the people who host them."
          invert
        />
        <div className="-mx-5 flex gap-4 overflow-x-auto scroll-rail scroll-snap-x px-5 pb-3 sm:mx-0 sm:gap-5 sm:px-0">
          {reels.map((r) => (
            <div key={r.slug} className="w-[220px] shrink-0 scroll-snap-start sm:w-[200px] lg:w-[220px]">
              <ReelCard reel={r} />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
