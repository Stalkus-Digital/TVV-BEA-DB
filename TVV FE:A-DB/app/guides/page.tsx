import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { GuideCard } from "@/components/cards/GuideCard";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { guidesService } from "@/lib/services";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Travel Guides — Field Notes from TVV Specialists",
  description:
    "Long-form travel writing from our specialists. Andaman season guides, Kerala slow-travel itineraries, Japan first-timer routes, luxury Rajasthan picks.",
  path: "/guides",
  keywords: [
    "travel guides India",
    "Andaman travel guide",
    "Kerala itinerary",
    "Japan travel guide",
    "luxury India travel blog",
  ],
});

export const revalidate = 1800;

export default async function GuidesIndexPage() {
  const res = await guidesService.list();
  const guides = res.ok ? res.data : [];
  const [feature, ...rest] = guides;
  return (
    <>
      <section className="bg-cream pt-10 pb-14">
        <Container>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Travel guides" }]} />
          <div className="mt-8 max-w-2xl">
            <p className="text-label uppercase text-teal">Editorial · Travel guides</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] tracking-tight text-balance text-ink">
              Field notes, not clickbait.
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-ink-secondary">
              Long-form writing from our specialists — useful, opinionated, and reported on the ground. No
              top-ten lists, no SEO listicles. Just the kind of writing we wish travel websites still wrote.
            </p>
          </div>
        </Container>
      </section>

      {feature && (
        <Section tone="cream" pad="default">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr]">
              <GuideCard guide={feature} variant="feature" />
              <div className="grid gap-8">
                {rest.slice(0, 3).map((g) => (
                  <GuideCard key={g.slug} guide={g} />
                ))}
              </div>
            </div>
          </Container>
        </Section>
      )}

      {guides.length > 0 && (
        <Section tone="white" pad="default">
          <Container>
            <SectionHeader eyebrow="All guides" title="The full archive." />
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((g) => (
                <GuideCard key={g.slug} guide={g} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <ConciergeCTA
        title="Inspired? Let's plan something."
        description="Every guide here is also a route — written by the specialist who'd plan your version of it."
      />
    </>
  );
}
