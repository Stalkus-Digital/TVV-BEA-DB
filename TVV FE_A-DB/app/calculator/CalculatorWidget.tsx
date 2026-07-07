"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { calculatorService } from "@/lib/services";
import type { CalculatorEstimate, CalculatorInput, Region, TravelStyle } from "@/lib/models";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

const styleOptions: { value: TravelStyle; label: string; note: string }[] = [
  { value: "essential", label: "Essential", note: "Comfortable boutique stays" },
  { value: "elevated", label: "Elevated", note: "Premium boutique & 4★" },
  { value: "luxury", label: "Luxury", note: "5★, vetted villas" },
  { value: "ultra-luxury", label: "Ultra-luxury", note: "Aman, Soneva, private" },
];

const regionOptions: { value: Region; label: string }[] = [
  { value: "andaman", label: "Andaman" },
  { value: "domestic", label: "India (domestic)" },
  { value: "international", label: "International" },
];

const themeOptions = [
  { value: "honeymoon", label: "Honeymoon" },
  { value: "family", label: "Family" },
  { value: "adventure", label: "Adventure" },
  { value: "wellness", label: "Wellness" },
];

export function CalculatorWidget() {
  const [pending, startTransition] = useTransition();
  const [estimate, setEstimate] = useState<CalculatorEstimate | null>(null);

  const [input, setInput] = useState<CalculatorInput>({
    destination: "Andaman Islands",
    region: "andaman",
    durationDays: 6,
    adults: 2,
    children: 0,
    travelStyle: "elevated",
    includeFlights: true,
    themes: ["honeymoon"],
  });

  function update<K extends keyof CalculatorInput>(key: K, value: CalculatorInput[K]) {
    setInput((s) => ({ ...s, [key]: value }));
  }

  function toggleTheme(value: string) {
    setInput((s) => {
      const has = s.themes?.includes(value);
      const next = has ? (s.themes ?? []).filter((t) => t !== value) : [...(s.themes ?? []), value];
      return { ...s, themes: next };
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await calculatorService.estimate(input);
      if (res.ok) setEstimate(res.data);
      else setEstimate(null);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr,1fr]">
      <form onSubmit={onSubmit} className="rounded-xl border border-line bg-white p-7 shadow-card" aria-label="Travel calculator">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Destination">
            <input
              type="text"
              required
              value={input.destination}
              onChange={(e) => update("destination", e.target.value)}
              placeholder="Where to?"
              className="input"
            />
          </Field>
          <Field label="Region">
            <select
              value={input.region}
              onChange={(e) => update("region", e.target.value as Region)}
              className="input"
            >
              {regionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Duration (days)">
            <input
              type="number"
              min={2}
              max={28}
              value={input.durationDays}
              onChange={(e) => update("durationDays", Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Adults">
            <input
              type="number"
              min={1}
              max={20}
              value={input.adults}
              onChange={(e) => update("adults", Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Children">
            <input
              type="number"
              min={0}
              max={10}
              value={input.children}
              onChange={(e) => update("children", Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Include flights?">
            <select
              value={input.includeFlights ? "yes" : "no"}
              onChange={(e) => update("includeFlights", e.target.value === "yes")}
              className="input"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </Field>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-label uppercase text-ink-secondary">Travel style</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {styleOptions.map((o) => {
              const active = input.travelStyle === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => update("travelStyle", o.value)}
                  className={cn(
                    "flex flex-col items-start rounded-md border px-4 py-3 text-left transition-colors",
                    active ? "border-teal bg-teal-light" : "border-line bg-white hover:border-teal/40",
                  )}
                >
                  <span className={cn("text-[14px] font-medium", active ? "text-teal" : "text-ink")}>
                    {o.label}
                  </span>
                  <span className="text-[11px] text-ink-muted">{o.note}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-label uppercase text-ink-secondary">Themes (optional)</p>
          <div className="flex flex-wrap gap-2">
            {themeOptions.map((t) => {
              const active = input.themes?.includes(t.value);
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => toggleTheme(t.value)}
                  className={cn(
                    "rounded-pill border px-3 py-1.5 text-[12px] font-medium transition-colors",
                    active ? "border-teal bg-teal text-white" : "border-line bg-white text-ink-secondary hover:border-teal hover:text-teal",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-teal px-6 text-[14px] font-medium text-white transition-colors hover:bg-teal-hover disabled:opacity-70"
        >
          {pending ? "Calculating…" : <>Calculate range <ArrowRight className="h-4 w-4" aria-hidden /></>}
        </button>

        <style jsx>{`
          :global(.input) {
            width: 100%;
            height: 44px;
            padding: 0 14px;
            border: 1px solid var(--tvv-border);
            border-radius: 10px;
            background: var(--tvv-white);
            color: var(--tvv-text-primary);
            font-size: 14px;
            outline: none;
            transition: border-color 150ms ease, box-shadow 150ms ease;
          }
          :global(.input:focus) {
            border-color: var(--tvv-teal);
            box-shadow: 0 0 0 3px rgba(11, 122, 117, 0.12);
          }
        `}</style>
      </form>

      <aside className="rounded-xl border border-line bg-white p-7 shadow-card">
        {!estimate ? (
          <div className="flex h-full flex-col items-start justify-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-light text-teal">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <p className="font-display text-[20px] text-ink">Your estimate will appear here.</p>
            <p className="text-[13px] leading-relaxed text-ink-secondary">
              Fill in the form on the left and we'll show a low-to-high range, broken down by accommodation,
              experiences, transport, taxes, and our specialist fee.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-label uppercase text-teal">Indicative range</p>
            <p className="mt-3 font-mono text-[34px] font-bold leading-none text-ink">
              {formatINR(estimate.rangeLow)} <span className="text-ink-muted">–</span> {formatINR(estimate.rangeHigh)}
            </p>
            <p className="mt-2 text-[13px] text-ink-secondary">
              ~{formatINR(estimate.perPerson)} per person · total ~{formatINR(estimate.total)}
            </p>
            <dl className="mt-6 space-y-3 border-t border-line pt-5 text-[13px]">
              <Row label="Accommodation" value={estimate.breakdown.accommodation} />
              <Row label="Experiences" value={estimate.breakdown.experiences} />
              <Row label="Transport" value={estimate.breakdown.transport} />
              {typeof estimate.breakdown.flights === "number" && (
                <Row label="Flights" value={estimate.breakdown.flights} />
              )}
              <Row label="Taxes" value={estimate.breakdown.taxes} />
              <Row label="Specialist fee" value={estimate.breakdown.specialistFee} />
            </dl>
            <p className="mt-6 rounded-md bg-surface px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
              {estimate.disclaimer}
            </p>
            <a
              href={`/contact?type=calculator&destination=${encodeURIComponent(input.destination)}&days=${input.durationDays}&adults=${input.adults}&children=${input.children}&style=${input.travelStyle}`}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-teal px-5 text-[14px] font-medium text-white hover:bg-teal-hover"
            >
              Turn this into a proposal →
            </a>
          </div>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-secondary">{label}</dt>
      <dd className="font-mono text-ink">{formatINR(value)}</dd>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-label uppercase text-ink-secondary">{label}</span>
      {children}
    </label>
  );
}
