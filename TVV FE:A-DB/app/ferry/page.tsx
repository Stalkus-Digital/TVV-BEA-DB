import { HeroSection, HeroBackground, HeroBreadcrumb } from "@/components/ui/HeroLayout";
import Image from "next/image";
import Link from "next/link";
import { Anchor, Clock, ShieldCheck, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { ferryService } from "@/lib/services";
import { buildMetadata } from "@/lib/seo";
import { formatPriceShort } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Andaman Ferry Booking — Makruzz, Green Ocean, ITT",
  description:
    "Book Andaman ferries with TVV — Makruzz, Green Ocean & ITT (government). Confirmed seats, premium cabin upgrades, transfer-included. Same-day confirmation.",
  path: "/ferry",
  keywords: [
    "Andaman ferry booking",
    "Makruzz ferry booking",
    "Green Ocean ferry Andaman",
    "Port Blair to Havelock ferry",
    "Havelock to Neil ferry",
    "ITT ferry Andaman",
  ],
});

export const revalidate = 300;

const operators = [
  {
    name: "Makruzz",
    type: "Premium",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=900&q=80",
    seats: ["Premium", "Deluxe", "Royal"],
    duration: "1h 30m",
    fromPrice: "₹1,650",
    notes: "Air-conditioned, indoor seating, premium cabin available. Most reliable in choppy weather.",
  },
  {
    name: "Green Ocean",
    type: "Express",
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=900&q=80",
    seats: ["Economy", "Premium", "Royal"],
    duration: "1h 45m",
    fromPrice: "₹1,200",
    notes: "Frequent departures, larger capacity. Multiple cabin classes for families and groups.",
  },
  {
    name: "ITT Majestic",
    type: "Government",
    image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=900&q=80",
    seats: ["Bunk", "Cabin", "First class"],
    duration: "2h 30m",
    fromPrice: "₹850",
    notes: "Government-operated, slowest but most economical. Limited online inventory — we hold seats.",
  },
];

export default async function FerryPage() {
  const routesRes = await ferryService.listRoutes();
  const routes = routesRes.ok ? routesRes.data : [];

  return (
    <>
      <HeroSection>
        <HeroBackground src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2400&q=85" />
        <Container>
          <HeroBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Andaman", href: "/andaman" }, { label: "Ferry booking" }]} />
          <div className="max-w-2xl">
            <p className="text-label uppercase text-gold drop-shadow-md">Andaman ferries · Same-day confirmation</p>
            <h1 className="mt-3 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-tight tracking-tight text-balance drop-shadow-lg">
              Confirmed ferry seats — every operator, every route.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/90 drop-shadow-md">
              We hold inventory on Makruzz, Green Ocean, and ITT. Hotel transfers, boarding assistance,
              and ferry-day specialist support are included on every booking.
            </p>

            <form action="/ferry/search" className="mt-8 grid gap-3 rounded-xl border border-white/15 bg-white/[0.05] p-4 backdrop-blur-md sm:grid-cols-[1fr,1fr,1fr,auto]" aria-label="Ferry search">
              <div>
                <label htmlFor="from" className="block text-[11px] uppercase tracking-[0.1em] text-white/55 drop-shadow-md">From</label>
                <select id="from" name="from" className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-white/[0.06] px-3 text-[14px] text-white outline-none focus:border-teal">
                  <option className="text-ink" value="PB">Port Blair</option>
                  <option className="text-ink" value="HV">Havelock</option>
                  <option className="text-ink" value="NL">Neil</option>
                </select>
              </div>
              <div>
                <label htmlFor="to" className="block text-[11px] uppercase tracking-[0.1em] text-white/55 drop-shadow-md">To</label>
                <select id="to" name="to" className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-white/[0.06] px-3 text-[14px] text-white outline-none focus:border-teal">
                  <option className="text-ink" value="HV">Havelock</option>
                  <option className="text-ink" value="NL">Neil</option>
                  <option className="text-ink" value="PB">Port Blair</option>
                </select>
              </div>
              <div>
                <label htmlFor="date" className="block text-[11px] uppercase tracking-[0.1em] text-white/55 drop-shadow-md">Date</label>
                <input id="date" name="date" type="date" className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-white/[0.06] px-3 text-[14px] text-white outline-none focus:border-teal" />
              </div>
              <div className="flex items-end">
                <button className="h-10 w-full rounded-md bg-teal px-6 text-[14px] font-medium text-white hover:bg-teal-hover sm:w-auto">
                  Check availability
                </button>
              </div>
            </form>
          </div>
        </Container>
      </HeroSection>

      <Section tone="cream" pad="default">
        <Container>
          <SectionHeader eyebrow="Ferry operators" title="Three operators. One booking experience." />
          <div className="grid gap-6 lg:grid-cols-3">
            {operators.map((op) => (
              <article key={op.name} className="overflow-hidden rounded-lg border border-line bg-white shadow-card">
                <div className="relative aspect-[16/9]">
                  <Image src={op.image} alt={op.name} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
                  <span className="absolute left-3 top-3 inline-flex items-center rounded-sm bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink shadow-card">
                    {op.type}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-[20px] text-ink">{op.name}</h3>
                  <div className="mt-3 flex items-center gap-x-5 gap-y-1 text-[12px] text-ink-secondary">
                    <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3 text-teal" aria-hidden /> {op.duration}</span>
                    <span className="font-mono text-teal font-semibold">from {op.fromPrice}</span>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary">{op.notes}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {op.seats.map((s) => (
                      <span key={s} className="rounded-sm border border-line bg-surface px-2 py-0.5 text-[11px] text-ink-secondary">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {routes.length > 0 && (
        <Section tone="white" pad="default">
          <Container>
            <SectionHeader
              eyebrow="Routes & schedules"
              title="All inter-island ferry routes."
              description="Schedules vary by month and weather. Our team confirms current timings on request — usually within an hour."
            />
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-surface text-[12px] uppercase tracking-[0.08em] text-ink-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">From</th>
                    <th className="px-5 py-3 font-medium">To</th>
                    <th className="px-5 py-3 font-medium">Crossing time</th>
                    <th className="px-5 py-3 font-medium">Starting price</th>
                    <th className="px-5 py-3 font-medium">Operators</th>
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {routes.map((r) => (
                    <tr key={r.slug} className="hover:bg-surface/50">
                      <td className="px-5 py-4 font-medium text-ink">{r.from.name}</td>
                      <td className="px-5 py-4 text-ink-secondary"><span className="inline-flex items-center gap-1"><ChevronRight className="h-3 w-3" aria-hidden /> {r.to.name}</span></td>
                      <td className="px-5 py-4 text-ink-secondary">{Math.round(r.averageCrossingMinutes / 5) * 5} min</td>
                      <td className="px-5 py-4 font-mono text-teal">{formatPriceShort(r.startingPrice)}</td>
                      <td className="px-5 py-4 text-[12px] text-ink-muted">{r.operators.length} operators</td>
                      <td className="px-5 py-4">
                        <Link href={`/ferry/${r.slug}`} className="text-[12px] font-medium text-teal hover:underline">
                          View schedules →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </Section>
      )}

      <Section tone="gold-light" pad="default">
        <Container>
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              { icon: ShieldCheck, t: "Confirmed seats", b: "We hold inventory. Same-day confirmation, even in peak season." },
              { icon: Anchor, t: "Transfers included", b: "Hotel pickup, jetty boarding assistance, drop-off on arrival." },
              { icon: Clock, t: "On-the-day support", b: "Weather delay? Our team rebooks and notifies your hotel automatically." },
            ].map((p) => (
              <div key={p.t} className="rounded-lg bg-white p-6 border border-gold/30">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold text-navy">
                  <p.icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="mt-4 font-display text-[18px] text-ink">{p.t}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">{p.b}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <ConciergeCTA
        eyebrow="Ferry concierge"
        title="Need help sequencing your Andaman ferries?"
        description="Tell us your itinerary — we'll book the right operator and class on each leg, with transfers, so you don't think about it twice."
        primaryLabel="Get a ferry quote"
        primaryHref="/contact?type=ferry"
        secondaryLabel="Plan my Andaman trip"
        secondaryHref="/andaman"
      />
    </>
  );
}
