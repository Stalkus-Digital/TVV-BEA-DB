import { notFound } from "next/navigation";
import Link from "next/link";
import { HeroSection, HeroBreadcrumb } from "@/components/ui/HeroLayout";
import { ArrowRight, Clock, Anchor } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { JsonLd } from "@/components/ui/JsonLd";
import { ferryService } from "@/lib/services";
import { ferryRouteStaticSlugs } from "@/lib/ssg/static-paths";
import { buildMetadata, breadcrumbJsonLd, SITE } from "@/lib/seo";
import { formatPriceShort } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await ferryRouteStaticSlugs();
  return slugs.map((route) => ({ route }));
}

export async function generateMetadata({ params }: { params: Promise<{ route: string }> }) {
  const { route } = await params;
  const res = await ferryService.getRoute(route);
  if (!res.ok || !res.data) {
    return buildMetadata({ title: "Route not found", description: "", path: `/ferry/${route}` });
  }
  const r = res.data;
  return buildMetadata({
    title: `${r.from.name} to ${r.to.name} Ferry — Schedules & Booking`,
    description: `Book ferries from ${r.from.name} to ${r.to.name} — confirmed seats across ${r.operators.length} operators, transfer-included. From ${formatPriceShort(r.startingPrice)} per traveller.`,
    path: `/ferry/${r.slug}`,
    keywords: [
      `${r.from.name} to ${r.to.name} ferry`,
      `${r.from.name} ${r.to.name} ferry booking`,
      "Andaman ferry",
      "Makruzz", "Green Ocean", "ITT ferry",
    ],
  });
}

export const revalidate = 300;

export default async function FerryRoutePage({ params }: { params: Promise<{ route: string }> }) {
  const { route } = await params;
  const routeRes = await ferryService.getRoute(route);
  if (!routeRes.ok || !routeRes.data) notFound();
  const r = routeRes.data;

  const schedulesRes = await ferryService.schedulesFor(r.from.code, r.to.code);
  const schedules = schedulesRes.ok ? schedulesRes.data : [];

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Andaman", href: "/andaman" },
    { label: "Ferry", href: "/ferry" },
    { label: `${r.from.name} → ${r.to.name}` },
  ];

  return (
    <>
      <HeroSection>
        <Container>
          <HeroBreadcrumb items={breadcrumbs} />
          <div className="max-w-3xl">
            <p className="text-label uppercase text-gold drop-shadow-md">Andaman ferry route</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-tight tracking-tight text-balance drop-shadow-lg">
              {r.from.name} <ArrowRight className="mx-3 inline h-7 w-7 text-gold align-middle" aria-hidden /> {r.to.name}
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/90 drop-shadow-md">
              {schedules.length > 0
                ? `${schedules.length} daily departures across ${r.operators.length} operators. Crossing time ranges roughly ${Math.min(...schedules.map((s) => s.durationMinutes))}–${Math.max(...schedules.map((s) => s.durationMinutes))} minutes.`
                : `${r.operators.length} operators serve this route. Average crossing time ~${r.averageCrossingMinutes} minutes.`}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/80 drop-shadow-md">
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gold" aria-hidden /> ~{r.averageCrossingMinutes} min</span>
              <span className="inline-flex items-center gap-1.5"><Anchor className="h-3.5 w-3.5 text-gold" aria-hidden /> From <span className="font-mono text-gold">{formatPriceShort(r.startingPrice)}</span></span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/contact?type=ferry&route=${r.slug}`} size="lg" className="px-7">Request a quote</ButtonLink>
              <ButtonLink href="/ferry" variant="outline-light" size="lg" className="px-7">All routes</ButtonLink>
            </div>
          </div>
        </Container>
      </HeroSection>

      <Section tone="cream" pad="default">
        <Container>
          <SectionHeader
            eyebrow="Schedules"
            title={`Departures from ${r.from.name} to ${r.to.name}`}
            description="Schedules are seasonal. Our team confirms exact day-of timings on every booking."
          />
          {schedules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-white p-12 text-center">
              <p className="font-display text-[20px] text-ink">No live schedules to show right now.</p>
              <p className="mt-2 text-[13px] text-ink-secondary">
                Write to a specialist for current timings on this route — usually replied within an hour.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-surface text-[12px] uppercase tracking-[0.08em] text-ink-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Operator</th>
                    <th className="px-5 py-3 font-medium">Departs</th>
                    <th className="px-5 py-3 font-medium">Arrives</th>
                    <th className="px-5 py-3 font-medium">Duration</th>
                    <th className="px-5 py-3 font-medium">Classes</th>
                    <th className="px-5 py-3 font-medium">From</th>
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {schedules.map((s) => (
                    <tr key={s.scheduleId} className="hover:bg-surface/50">
                      <td className="px-5 py-4 font-medium text-ink">{s.operatorName}</td>
                      <td className="px-5 py-4 font-mono text-ink-secondary">{s.departureTime}</td>
                      <td className="px-5 py-4 font-mono text-ink-secondary">{s.arrivalTime}</td>
                      <td className="px-5 py-4 text-ink-secondary">{s.durationMinutes} min</td>
                      <td className="px-5 py-4 text-[12px] text-ink-muted">{s.classes.join(" · ")}</td>
                      <td className="px-5 py-4 font-mono text-teal">{formatPriceShort(s.startingPrice)}</td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/contact?type=ferry&route=${r.slug}&schedule=${s.scheduleId}`}
                          className="text-[12px] font-medium text-teal hover:underline"
                        >
                          Hold seats →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Container>
      </Section>

      <ConciergeCTA
        eyebrow="Ferry concierge"
        title={`Booking ${r.from.name} → ${r.to.name}? We do this every day.`}
        description="Our team holds inventory across operators. Same-day confirmation, transfers included, weather delays handled."
        primaryLabel="Hold my seats"
        primaryHref={`/contact?type=ferry&route=${r.slug}`}
      />

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs.map((b) => ({ name: b.label, url: b.href ?? `/ferry/${r.slug}` }))),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            serviceType: "Ferry booking",
            name: `${r.from.name} to ${r.to.name} ferry`,
            provider: { "@type": "Organization", name: SITE.name },
            areaServed: "Andaman & Nicobar Islands",
            offers: {
              "@type": "Offer",
              price: r.startingPrice,
              priceCurrency: r.currency,
              availability: "https://schema.org/InStock",
            },
          },
        ]}
      />
    </>
  );
}
