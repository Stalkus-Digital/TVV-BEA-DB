import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Section } from "@/components/ui/Section";
import { ExperienceCard } from "@/components/cards/ExperienceCard";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { experiencesService } from "@/lib/services";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Experiences — Travel the Way You Travel",
  description:
    "Honeymoon, luxury, adventure, wellness, family, scuba, culinary, cultural — pick the way you travel and we'll route a journey around it.",
  path: "/experiences",
});

export const revalidate = 600;

export default async function ExperiencesPage() {
  const res = await experiencesService.list();
  const experiences = res.ok ? res.data : [];
  return (
    <>
      <section className="bg-cream pt-10 pb-12">
        <Container>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Experiences" }]} />
          <div className="mt-8 max-w-2xl">
            <p className="text-label uppercase text-teal">Travel by experience</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] tracking-tight text-balance text-ink">
              The way you travel, not the place you go.
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-ink-secondary">
              Pick a thread — honeymoon, adventure, slow wellness, food — and we'll build a journey around it,
              across destinations or deep into one.
            </p>
          </div>
        </Container>
      </section>

      <Section tone="cream" pad="default">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {experiences.map((e) => (
              <ExperienceCard key={e.slug} experience={e} />
            ))}
          </div>
        </Container>
      </Section>

      <ConciergeCTA
        title="Have an experience in mind we haven't listed?"
        description="From private cooking classes in Hoi An to PADI advanced-open-water in Havelock — if we can find the right specialist on the ground, we can plan it."
      />
    </>
  );
}
