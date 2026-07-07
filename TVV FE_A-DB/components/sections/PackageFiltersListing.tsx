"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PackageListing } from "@/components/sections/PackageListing";
import type { Package } from "@/lib/models";
import { packagesService } from "@/lib/services";

type Option = { label: string; value: string };

const locationOptions: Option[] = [
  { label: "All", value: "all" },
  { label: "Andaman", value: "andaman" },
  { label: "India", value: "india" },
  { label: "Asia & Pacific", value: "asia-pacific" },
  { label: "Europe", value: "europe" },
  { label: "Indian Ocean", value: "indian-ocean" },
  { label: "Middle East", value: "middle-east" },
];

const tripTypeOptions: Option[] = [
  { label: "All", value: "all" },
  { label: "Honeymoon packages", value: "honeymoon" },
  { label: "Family tours", value: "family" },
  { label: "Adventure & trekking", value: "adventure" },
  { label: "Group tours", value: "group" },
  { label: "Luxury escapes", value: "luxury" },
];

const durationOptions: Option[] = [
  { label: "All", value: "all" },
  { label: "Weekend (2–3 days)", value: "weekend-2-3" },
  { label: "Short break (4–5 days)", value: "short-break-4-5" },
  { label: "Week-long (6–8 days)", value: "week-long-6-8" },
  { label: "Extended (9+ days)", value: "extended-9-plus" },
];

function pickOrAll(value: string | null) {
  return value && value.trim() ? value : "all";
}

export function PackageFiltersListing({
  emptyTitle = "No exact matches right now.",
  emptyHint = "Try adjusting your filters, or let our specialists design a custom itinerary from scratch.",
}: {
  emptyTitle?: string;
  emptyHint?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selected = useMemo(() => {
    const region = pickOrAll(searchParams.get("region"));
    const tripType = pickOrAll(searchParams.get("tripType"));
    const durationTag = pickOrAll(searchParams.get("durationTag"));
    return { region, tripType, durationTag };
  }, [searchParams]);

  const [data, setData] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function updateParam(key: "region" | "tripType" | "durationTag", value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);

    // Keep any other existing params intact (search, minDays, maxDays, etc.)
    startTransition(() => {
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);

      const region = searchParams.get("region") ?? undefined;
      const tripType = searchParams.get("tripType") ?? undefined;
      const durationTag = searchParams.get("durationTag") ?? undefined;

      // Forward all query params (including ones not controlled by this UI),
      // but omit empty/all values.
      const forwarded: Record<string, string> = {};
      for (const [k, v] of searchParams.entries()) {
        if (!v || v === "all") continue;
        forwarded[k] = v;
      }
      if (region === "all") delete forwarded.region;
      if (tripType === "all") delete forwarded.tripType;
      if (durationTag === "all") delete forwarded.durationTag;

      const res = await packagesService.listRemote(forwarded);
      if (cancelled) return;
      if (!res.ok) {
        setData([]);
        setError(res.error.message || "Failed to load packages.");
      } else {
        setData(res.data);
      }
      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div>
      <div className="mb-8 grid gap-4 rounded-2xl border border-line/50 bg-white/60 p-5 backdrop-blur-md sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.15em] text-ink-muted">
            Location
          </span>
          <select
            className="h-11 w-full rounded-xl border border-line/40 bg-white/70 px-3 text-[14px] font-medium text-ink focus:border-teal focus:outline-none"
            value={selected.region}
            onChange={(e) => updateParam("region", e.target.value)}
          >
            {locationOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.15em] text-ink-muted">
            Trip type
          </span>
          <select
            className="h-11 w-full rounded-xl border border-line/40 bg-white/70 px-3 text-[14px] font-medium text-ink focus:border-teal focus:outline-none"
            value={selected.tripType}
            onChange={(e) => updateParam("tripType", e.target.value)}
          >
            {tripTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.15em] text-ink-muted">
            Duration
          </span>
          <select
            className="h-11 w-full rounded-xl border border-line/40 bg-white/70 px-3 text-[14px] font-medium text-ink focus:border-teal focus:outline-none"
            value={selected.durationTag}
            onChange={(e) => updateParam("durationTag", e.target.value)}
          >
            {durationOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(loading || isPending) && (
        <div className="mb-8 flex items-center gap-2 text-[13px] font-medium text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading packages…
        </div>
      )}

      {error ? (
        <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-[14px] text-red-900">
          {error}
        </div>
      ) : (
        <PackageListing packages={data} emptyTitle={emptyTitle} emptyHint={emptyHint} />
      )}
    </div>
  );
}

