"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import type { Pricing } from "@/lib/models";
import { formatINR } from "@/lib/utils";
import { SITE } from "@/lib/seo";

interface PackagePriceCardProps {
  packageSlug: string;
  packageTitle: string;
  pricing: Pricing;
}

export function PackagePriceCard({ packageSlug, packageTitle, pricing }: PackagePriceCardProps) {
  const [pax, setPax] = useState(2);
  const saved = pricing.originalPerAdult ? pricing.originalPerAdult - pricing.perAdult : 0;

  const whatsappHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    `Hello TVV, I'd like a proposal for ${packageTitle} for ${pax} adult${pax > 1 ? "s" : ""}.`,
  )}`;

  return (
    <aside className="overflow-hidden rounded-xl border border-line/40 bg-white/80 shadow-modal backdrop-blur-xl">
      <div className="p-8 pb-6">
        {pricing.originalPerAdult && (
          <p className="mb-1 font-mono text-[13px] text-danger/80 line-through">
            {formatINR(pricing.originalPerAdult)}
          </p>
        )}
        <p className="font-display text-[40px] leading-none tracking-tight text-ink">
          {formatINR(pricing.perAdult)}
          <span className="ml-2 align-baseline font-sans text-[13px] font-medium uppercase tracking-wide text-ink-muted">
            / {pricing.pricingModel === "per-couple" ? "Couple" : "Adult"}
          </span>
        </p>
        {saved > 0 && (
          <p className="mt-3 inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal">
            Save {formatINR(saved)} per adult
          </p>
        )}
      </div>

      <div className="space-y-5 px-8 pb-8">
        <PricingMatrix pricing={pricing} pax={pax} />

        <div className="rounded-xl border border-line/60 bg-white p-2">
          <label htmlFor="package-pax" className="block px-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            Travellers
          </label>
          <div className="flex h-11 items-center justify-between">
            <button
              type="button"
              onClick={() => setPax(Math.max(1, pax - 1))}
              className="flex h-full min-w-11 items-center justify-center text-ink-secondary transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              aria-label="Decrease travellers"
            >
              −
            </button>
            <span id="package-pax" className="font-mono text-[15px] font-medium text-ink">
              {pax}
            </span>
            <button
              type="button"
              onClick={() => setPax(Math.min(20, pax + 1))}
              className="flex h-full min-w-11 items-center justify-center text-ink-secondary transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              aria-label="Increase travellers"
            >
              +
            </button>
          </div>
        </div>

        <Link
          href={`/contact?tour=${packageSlug}&pax=${pax}`}
          className="group relative flex h-14 w-full items-center justify-center gap-2 rounded-full bg-teal px-6 text-[13px] font-bold uppercase tracking-widest text-white shadow-[0_8px_20px_rgba(14,99,92,0.2)] transition-all hover:-translate-y-0.5 hover:bg-teal-hover"
        >
          Request a Proposal
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-line/80 bg-white text-[13px] font-bold uppercase tracking-widest text-ink transition-all hover:border-teal hover:bg-teal/5 hover:text-teal"
        >
          <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp Us
        </a>
      </div>

      <div className="space-y-3 border-t border-line/40 bg-cream/50 p-6">
        {[
          "No charge until you approve a written proposal.",
          "Specialist replies within four working hours.",
          "24/7 dedicated concierge during travel.",
        ].map((text) => (
          <p key={text} className="flex items-start gap-3 text-[13px] font-medium text-ink-secondary">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
            <span className="text-pretty leading-relaxed">{text}</span>
          </p>
        ))}
      </div>
    </aside>
  );
}

function PricingMatrix({ pricing, pax }: { pricing: Pricing; pax: number }) {
  const rows = useMemo(() => {
    const multiplier = pricing.pricingModel === "per-couple" ? Math.ceil(pax / 2) : pax;
    const estimated = pricing.perAdult * multiplier;
    const base = [
      { label: "Per adult", value: formatINR(pricing.perAdult) },
      ...(pricing.originalPerAdult
        ? [{ label: "Published rate", value: formatINR(pricing.originalPerAdult) }]
        : []),
      ...(pricing.breakdown?.taxes
        ? [{ label: "Taxes & fees", value: formatINR(pricing.breakdown.taxes) }]
        : []),
      ...(pricing.breakdown?.discount
        ? [{ label: "Package discount", value: `−${formatINR(pricing.breakdown.discount)}` }]
        : []),
      { label: `Est. for ${pax} traveller${pax > 1 ? "s" : ""}`, value: formatINR(estimated), emphasis: true },
    ];
    return base;
  }, [pax, pricing]);

  return (
    <div className="rounded-xl border border-line/50 bg-cream/30 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal">Pricing overview</p>
      <dl className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 text-[13px]">
            <dt className={row.emphasis ? "font-semibold text-ink" : "text-ink-secondary"}>{row.label}</dt>
            <dd className={row.emphasis ? "font-mono font-semibold text-teal" : "font-mono text-ink"}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      {pricing.dynamic && (
        <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
          Live inventory pricing — final quote confirmed by your specialist.
        </p>
      )}
    </div>
  );
}
