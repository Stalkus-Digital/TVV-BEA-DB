"use client";

import { useMemo, useState } from "react";
import { PackageCard } from "@/components/cards/PackageCard";
import { FilterChips } from "@/components/ui/FilterChips";
import { cn } from "@/lib/utils";
import type { Package } from "@/lib/models";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

interface PackageListingProps {
  packages: Package[];
  themes?: { label: string; value: string }[];
  emptyTitle?: string;
  emptyHint?: string;
}

const defaultThemes = [
  { label: "All", value: "all" },
  { label: "Honeymoon", value: "honeymoon" },
  { label: "Luxury", value: "luxury" },
  { label: "Family", value: "family" },
  { label: "Adventure", value: "adventure" },
  { label: "Culture", value: "culture" },
  { label: "Wellness", value: "wellness" },
];

const sortOptions = [
  { label: "Most relevant", value: "relevant" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Top rated", value: "rating" },
  { label: "Shortest duration", value: "duration-asc" },
];

export function PackageListing({
  packages,
  themes = defaultThemes,
  emptyTitle = "No exact matches right now.",
  emptyHint = "Try adjusting your filters, or let our specialists design a custom itinerary from scratch.",
}: PackageListingProps) {
  const [theme, setTheme] = useState("all");
  const [sort, setSort] = useState("relevant");

  const filtered = useMemo(() => {
    if (!packages) return [];
    const base = theme === "all" ? packages : packages.filter((p) => p.themes?.includes(theme));
    const copy = [...base];
    switch (sort) {
      case "price-asc": copy.sort((a, b) => a.pricing.perAdult - b.pricing.perAdult); break;
      case "price-desc": copy.sort((a, b) => b.pricing.perAdult - a.pricing.perAdult); break;
      case "rating": copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case "duration-asc": copy.sort((a, b) => a.durationDays - b.durationDays); break;
    }
    return copy;
  }, [packages, theme, sort]);

  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
      
      {/* MOBILE STICKY TOP BAR */}
      <div className="sticky top-[60px] z-30 -mx-6 mb-8 border-b border-line/50 bg-cream/95 px-6 py-4 backdrop-blur-md lg:hidden">
        <FilterChips options={themes} defaultValue="all" onChange={setTheme} ariaLabel="Filter by theme" />
        <div className="mt-4 flex items-center gap-3">
          <SlidersHorizontal className="h-4 w-4 text-ink-muted" />
          <select
            id="sort-mobile"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-8 w-full appearance-none rounded-md border border-line/40 bg-white/50 px-3 text-[13px] font-medium text-ink focus:border-teal focus:outline-none"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DESKTOP STICKY SIDEBAR */}
      <aside className="hidden lg:sticky lg:top-32 lg:block lg:w-[220px] lg:shrink-0 space-y-12">
        <div>
          <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.15em] text-ink-muted">Filter by Theme</h3>
          <div className="flex flex-col items-start gap-1">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  "relative py-1.5 text-[15px] transition-colors duration-300",
                  theme === t.value ? "font-medium text-teal" : "text-ink-secondary hover:text-ink"
                )}
              >
                {t.label}
                {theme === t.value && (
                  <motion.div
                    layoutId="desktopActiveTheme"
                    className="absolute -left-4 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-teal"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.15em] text-ink-muted">Sort By</h3>
          <div className="flex flex-col items-start gap-1">
            {sortOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => setSort(o.value)}
                className={cn(
                  "relative py-1.5 text-[15px] transition-colors duration-300",
                  sort === o.value ? "font-medium text-teal" : "text-ink-secondary hover:text-ink"
                )}
              >
                {o.label}
                {sort === o.value && (
                  <motion.div
                    layoutId="desktopActiveSort"
                    className="absolute -left-4 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-teal"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN GRID */}
      <div className="min-w-0 flex-1">
        <div className="mb-8 hidden items-center justify-between border-b border-line/40 pb-4 lg:flex">
          <p className="text-[13px] font-medium uppercase tracking-widest text-ink-secondary">
            Showing <span className="font-bold text-ink">{filtered.length}</span> curated journeys
          </p>
        </div>

        {filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-line/80 bg-white/50 px-6 py-24 text-center"
          >
            <p className="font-display text-[24px] text-ink">{emptyTitle}</p>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-secondary text-balance">{emptyHint}</p>
            <Link 
              href="/contact" 
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-teal px-8 text-[13px] font-bold uppercase tracking-widest text-white shadow-[0_8px_20px_rgba(14,99,92,0.15)] transition-all hover:-translate-y-0.5 hover:bg-teal-hover hover:shadow-[0_12px_24px_rgba(14,99,92,0.25)]"
            >
              Talk to a Specialist
            </Link>
          </motion.div>
        ) : (
          <motion.div layout className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <motion.div
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <PackageCard data={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
