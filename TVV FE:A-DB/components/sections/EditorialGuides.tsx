import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { GuideCard } from "@/components/cards/GuideCard";
import type { Guide } from "@/lib/models";

interface EditorialGuidesProps {
  guides: Guide[];
}

export function EditorialGuides({ guides }: EditorialGuidesProps) {
  if (!guides || guides.length === 0) return null;
  const [hero, ...rest] = guides;
  return (
    <Section tone="cream" pad="default">
      <Container>
        <SectionHeader
          eyebrow="Editorial travel guides"
          title="Field notes from our specialists."
          description="Long-form writing for travellers who decide slowly. No clickbait, no top-ten lists — just useful, opinionated, on-the-ground reporting."
          viewAllHref="/guides"
          viewAllLabel="All guides"
        />
        <div className="grid gap-16 lg:grid-cols-[1.6fr,1fr] lg:gap-24">
          <GuideCard guide={hero} variant="feature" />
          <div className="flex flex-col gap-10">
            {rest.slice(0, 3).map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
