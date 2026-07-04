import { HeroSection, HeroBackground, HeroBreadcrumb } from "@/components/ui/HeroLayout";
import Image from "next/image";
import { Building2, Users, Award, FileCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { ButtonLink } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Corporate & MICE Travel — Offsites, Incentives, Conferences",
  description:
    "TVV Corporate designs incentive trips, offsites, conferences and team events for groups of 12 to 600. Single point of contact, in-house ground teams.",
  path: "/corporate",
  keywords: [
    "corporate travel India",
    "MICE travel India",
    "company offsite",
    "incentive travel",
    "team offsite Andaman",
    "Goa corporate offsite",
  ],
});

const services = [
  { icon: Building2, title: "Offsites", body: "Annual offsites, leadership retreats, team kick-offs. Venue, logistics, content support." },
  { icon: Award, title: "Incentive travel", body: "Reward trips for sales teams, dealers, channel partners. Curated, branded, measurable." },
  { icon: Users, title: "Conferences", body: "Pharma, finance, tech — closed-room conferences with delegate concierge and IT support." },
  { icon: FileCheck, title: "Team events", body: "Day events, weekend programmes, family days. Adventure, wellness, cultural formats." },
];

const facts = [
  { v: "12–600", l: "Delegate range" },
  { v: "120+", l: "Companies served" },
  { v: "98%", l: "On-time delivery" },
  { v: "1", l: "Point of contact" },
];

export default function CorporatePage() {
  return (
    <>
      <HeroSection>
        <HeroBackground src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=2400&q=85" opacity={60} />
        <Container>
          <HeroBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Corporate" }]} />
          <div className="max-w-2xl">
            <p className="text-label uppercase text-gold drop-shadow-md">TVV Corporate · MICE</p>
            <h1 className="mt-3 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-tight tracking-tight text-balance drop-shadow-lg">
              Corporate travel that runs the way your business does.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/90 drop-shadow-md">
              Offsites, incentive trips, conferences, dealer meets. One specialist, one timeline, in-house ground
              teams in our key destinations. No surprises, no escalation queue.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="mailto:corporate@thevacationvoice.com" size="lg" className="px-7">
                corporate@thevacationvoice.com
              </ButtonLink>
              <ButtonLink href="/contact?type=corporate" variant="outline-light" size="lg" className="px-7">
                Request a proposal
              </ButtonLink>
            </div>

            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.l}>
                  <dt className="font-display text-[24px] font-bold text-white">{f.v}</dt>
                  <dd className="text-[12px] text-white/55">{f.l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </HeroSection>

      <Section tone="cream" pad="default">
        <Container>
          <SectionHeader eyebrow="What we do" title="Four formats. One playbook." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div key={s.title} className="rounded-lg border border-line bg-white p-7">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-light text-teal">
                  <s.icon className="h-4 w-4" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-[18px] text-ink">{s.title}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="white" pad="default">
        <Container size="default">
          <SectionHeader eyebrow="How we run a programme" title="The TVV corporate runbook." />
          <ol className="mt-8 space-y-6">
            {[
              { t: "Brief & scope", b: "A two-hour kickoff call. We agree on objectives, budget, dates, and constraints." },
              { t: "Proposal", b: "Within 72 hours: a written programme with venue, logistics, agenda, costing." },
              { t: "Contract & deposit", b: "A 30% commitment confirms inventory. Final billing on a single GST-compliant invoice." },
              { t: "Pre-event ops", b: "Delegate communications, dietary capture, travel logistics, branded collateral, IT support." },
              { t: "On-site execution", b: "On-the-ground team, hotline number for delegates, real-time issue resolution." },
              { t: "Post-event report", b: "A written debrief, expense reconciliation, learnings for next year's programme." },
            ].map((step, i) => (
              <li key={step.t} className="flex gap-5 rounded-lg border border-line bg-white p-6">
                <span className="font-display text-[28px] font-bold text-teal/80">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-display text-[18px] text-ink">{step.t}</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-secondary">{step.b}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <ConciergeCTA
        eyebrow="Corporate concierge"
        title="Planning an offsite, incentive or conference?"
        description="Write to our corporate desk — we'll send a scoped proposal within 72 hours. We work with companies of 12 to 600 delegates."
        primaryLabel="Email corporate@thevacationvoice.com"
        primaryHref="mailto:corporate@thevacationvoice.com"
      />
    </>
  );
}
