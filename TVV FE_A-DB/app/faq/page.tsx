import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { faqsService } from "@/lib/services";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata, faqJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "FAQs — The Vacation Voice",
  description:
    "Frequently asked questions about TVV — how we plan, what's included, our Andaman expertise, booking & cancellation, corporate travel.",
  path: "/faq",
});

export const revalidate = 1800;

export default async function FAQPage() {
  const res = await faqsService.list();
  const faqs = res.ok ? res.data : [];
  const sections = [
    { title: "How we work", items: faqs.filter((f) => f.category === "how-we-work") },
    { title: "Destinations & expertise", items: faqs.filter((f) => f.category === "destinations" || f.category === "andaman") },
    { title: "Booking & policies", items: faqs.filter((f) => f.category === "booking") },
    { title: "Corporate travel", items: faqs.filter((f) => f.category === "corporate") },
  ];
  return (
    <>
      <section className="bg-cream pt-10 pb-12">
        <Container size="default">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
          <div className="mt-8 max-w-2xl">
            <p className="text-label uppercase text-teal">FAQs</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] tracking-tight text-balance text-ink">
              Questions our travellers ask, answered honestly.
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-ink-secondary">
              Can't find the answer here? Write to your specialist — they reply within four working hours.
            </p>
          </div>
        </Container>
      </section>

      <Section tone="cream" pad="default">
        <Container size="default">
          <div className="space-y-12">
            {sections.filter((s) => s.items.length > 0).map((section) => (
              <div key={section.title}>
                <h2 className="font-display text-[22px] text-ink">{section.title}</h2>
                <div className="mt-5 divide-y divide-line rounded-lg border border-line bg-white">
                  {section.items.map((f, i) => (
                    <details key={i} className="group">
                      <summary className="flex cursor-pointer items-center justify-between gap-5 px-6 py-5 [&::-webkit-details-marker]:hidden">
                        <h3 className="font-display text-[16px] text-ink">{f.q}</h3>
                        <span aria-hidden className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted transition-transform duration-base group-open:rotate-45">+</span>
                      </summary>
                      <p className="px-6 pb-5 text-[14px] leading-relaxed text-ink-secondary">{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <ConciergeCTA />

      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
    </>
  );
}
