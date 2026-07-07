import { Calculator } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { CalculatorWidget } from "./CalculatorWidget";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Travel Calculator — Estimate Your Curated Journey",
  description:
    "An indicative travel-cost estimator built by TVV specialists. Pick a destination, dates, travel style — see a ballpark range before you enquire.",
  path: "/calculator",
});

export const revalidate = 600;

const tools = [
  { title: "Honest ranges", body: "Low, mid, and high — not a single misleading number." },
  { title: "Built on real data", body: "Our specialists tune the underlying baselines from the proposals we send every week." },
  { title: "Routes into a proposal", body: "Hand off your estimate to a specialist — your context carries across." },
];

export default function CalculatorPage() {
  return (
    <>
      <section className="bg-cream pt-10 pb-12">
        <Container>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Travel calculator" }]} />
          <div className="mt-8 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-teal">
              <Calculator className="h-3 w-3" aria-hidden /> Travel calculator
            </span>
            <h1 className="mt-4 font-display text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] tracking-tight text-balance text-ink">
              Get a sense of the spend before you talk to us.
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-ink-secondary">
              An indicative range based on destination, party size, dates, and how you like to travel.
              It's not a quote — it's a baseline. Real proposals are written by specialists, using current
              rates and seasonality.
            </p>
          </div>
        </Container>
      </section>

      <Section tone="cream" pad="default">
        <Container>
          <CalculatorWidget />
        </Container>
      </Section>

      <Section tone="white" pad="default">
        <Container size="default">
          <SectionHeader eyebrow="How this works" title="An honest tool, not a sales gimmick." align="center" />
          <div className="grid gap-6 sm:grid-cols-3">
            {tools.map((t) => (
              <div key={t.title} className="rounded-lg border border-line bg-white p-7">
                <h3 className="font-display text-[18px] text-ink">{t.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">{t.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <ConciergeCTA
        eyebrow="Calculator → proposal"
        title="Like the range? Let's turn it into a proposal."
        description="A specialist will write your real estimate within four hours — built around your dates, your party, and the way you travel."
      />
    </>
  );
}
