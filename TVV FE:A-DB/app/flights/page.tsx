import { HeroSection, HeroBreadcrumb } from "@/components/ui/HeroLayout";
import { Plane, Briefcase, Clock, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { flightsService } from "@/lib/services";
import { buildMetadata } from "@/lib/seo";
import { formatINR } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Flights — Curated Airfare with Specialist Support",
  description:
    "Book curated economy, premium-economy, business and first-class fares through TVV specialists. Multi-city routes, partner upgrades, and 24/7 ground support.",
  path: "/flights",
  keywords: [
    "premium flight booking",
    "business class flights India",
    "Andaman flight booking",
    "Maldives flight booking",
    "Japan flight booking",
    "Europe flight booking",
  ],
});

export const revalidate = 60;

const trustPoints = [
  { icon: Briefcase, t: "Curated fares, not crawled fares", b: "We work through partner consolidators — corporate rates, family bundles, premium upgrades when they exist." },
  { icon: ShieldCheck, t: "Schedule changes — handled", b: "Airline reissues, voluntary changes, missed-connection rebookings: a single specialist manages the lifecycle." },
  { icon: Clock, t: "24/7 ground support", b: "A real person on WhatsApp through your trip — not a centre, not a chatbot." },
];

export default async function FlightsPage() {
  const [airportsRes, sampleRes] = await Promise.all([
    flightsService.airports(),
    flightsService.search({
      from: "BLR",
      to: "IXZ",
      departDate: new Date().toISOString().slice(0, 10),
      tripType: "one-way",
      adults: 2,
    }),
  ]);
  const airports = airportsRes.ok ? airportsRes.data : [];
  const sample = sampleRes.ok ? sampleRes.data.results.slice(0, 4) : [];

  return (
    <>
      <HeroSection>
        <Container>
          <HeroBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Flights" }]} />
          <div className="max-w-3xl">
            <p className="text-label uppercase text-gold drop-shadow-md">Flights · Specialist-booked</p>
            <h1 className="mt-3 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-tight tracking-tight text-balance drop-shadow-lg">
              Flights, the way a specialist would book them.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/90 drop-shadow-md">
              No comparison aggregators, no banner ads. Tell us where you're going — we'll send a fare brief
              (economy, premium-economy, business) with seats, baggage, refundability, and the trade-offs
              clearly written out.
            </p>

            <form action="/flights/search" className="mt-8 grid gap-3 rounded-xl border border-white/15 bg-white/[0.05] p-4 backdrop-blur-md sm:grid-cols-[1fr,1fr,1fr,1fr,auto]" aria-label="Flight search">
              <div>
                <label htmlFor="from" className="block text-[11px] uppercase tracking-[0.1em] text-white/55">From</label>
                <input
                  id="from"
                  name="from"
                  list="airports"
                  placeholder="BLR / Bengaluru"
                  className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-white/[0.06] px-3 text-[14px] text-white placeholder:text-white/35 outline-none focus:border-teal"
                />
              </div>
              <div>
                <label htmlFor="to" className="block text-[11px] uppercase tracking-[0.1em] text-white/55">To</label>
                <input
                  id="to"
                  name="to"
                  list="airports"
                  placeholder="IXZ / Port Blair"
                  className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-white/[0.06] px-3 text-[14px] text-white placeholder:text-white/35 outline-none focus:border-teal"
                />
              </div>
              <div>
                <label htmlFor="depart" className="block text-[11px] uppercase tracking-[0.1em] text-white/55">Depart</label>
                <input id="depart" name="depart" type="date" className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-white/[0.06] px-3 text-[14px] text-white outline-none focus:border-teal" />
              </div>
              <div>
                <label htmlFor="cabin" className="block text-[11px] uppercase tracking-[0.1em] text-white/55">Cabin</label>
                <select id="cabin" name="cabin" className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-white/[0.06] px-3 text-[14px] text-white outline-none focus:border-teal">
                  <option className="text-ink">Economy</option>
                  <option className="text-ink">Premium economy</option>
                  <option className="text-ink">Business</option>
                  <option className="text-ink">First</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="h-10 w-full rounded-md bg-teal px-6 text-[14px] font-medium text-white hover:bg-teal-hover sm:w-auto">Search</button>
              </div>
              <datalist id="airports">
                {airports.map((a) => (
                  <option key={a.code} value={`${a.code} / ${a.city}`}>{a.name}</option>
                ))}
              </datalist>
            </form>
          </div>
        </Container>
      </HeroSection>

      {sample.length > 0 && (
        <Section tone="cream" pad="default">
          <Container>
            <SectionHeader
              eyebrow="Sample fares — Bengaluru → Port Blair"
              title="A sense of how we'd write up a fare brief."
              description="Indicative only — real proposals are built around your dates, cabin, baggage and refundability needs."
            />
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-surface text-[12px] uppercase tracking-[0.08em] text-ink-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Airline</th>
                    <th className="px-5 py-3 font-medium">Route</th>
                    <th className="px-5 py-3 font-medium">Duration</th>
                    <th className="px-5 py-3 font-medium">Stops</th>
                    <th className="px-5 py-3 font-medium">Cabin</th>
                    <th className="px-5 py-3 font-medium">Refundable</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {sample.map((it) => {
                    const leg = it.legs[0];
                    const first = leg.segments[0];
                    const last = leg.segments[leg.segments.length - 1];
                    return (
                      <tr key={it.itineraryId} className="hover:bg-surface/50">
                        <td className="px-5 py-4 font-medium text-ink">{first.airline.name}</td>
                        <td className="px-5 py-4 text-ink-secondary">{first.from.code} → {last.to.code}</td>
                        <td className="px-5 py-4 font-mono text-ink-secondary">{Math.floor(leg.totalDurationMinutes / 60)}h {leg.totalDurationMinutes % 60}m</td>
                        <td className="px-5 py-4 text-ink-secondary">{leg.stops === 0 ? "Non-stop" : `${leg.stops} stop`}</td>
                        <td className="px-5 py-4 text-ink-secondary capitalize">{first.cabin.replace("-", " ")}</td>
                        <td className="px-5 py-4 text-[12px] text-ink-muted">{it.fare.refundable ? "Yes" : "No"}</td>
                        <td className="px-5 py-4 font-mono font-semibold text-teal">{formatINR(it.fare.totalPrice)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Container>
        </Section>
      )}

      <Section tone="white" pad="default">
        <Container>
          <SectionHeader eyebrow="The TVV flight service" title="Three reasons travellers route flights through us." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trustPoints.map((p) => (
              <div key={p.t} className="rounded-lg border border-line bg-white p-7">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-light text-teal">
                  <p.icon className="h-4 w-4" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-[18px] text-ink">{p.t}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary">{p.b}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="gold-light" pad="default">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-label uppercase text-teal">Travelling on a TVV package?</p>
              <p className="mt-2 font-display text-[20px] text-ink">
                Flights are quoted alongside every proposal — including premium-cabin and partner-airline upgrades.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-[14px] font-medium text-teal">
              <Plane className="h-4 w-4" aria-hidden /> Built into every itinerary
            </div>
          </div>
        </Container>
      </Section>

      <ConciergeCTA
        eyebrow="Flight concierge"
        title="Want a fare brief written by a real specialist?"
        description="Tell us the route and the trip — we'll come back with a written comparison (economy, premium, business) within four hours."
        primaryLabel="Request a fare brief"
        primaryHref="/contact?type=flights"
      />
    </>
  );
}
