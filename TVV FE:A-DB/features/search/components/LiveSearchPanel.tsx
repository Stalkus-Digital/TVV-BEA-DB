"use client";

import Link from "next/link";
import { Clock, Loader2, MapPin, Package, BookOpen } from "lucide-react";
import { formatINR } from "@/lib/utils";
import type { SearchResults } from "../types";
import { packageDetailPath } from "@/features/packages";
import { searchPath } from "../paths";

interface LiveSearchPanelProps {
  query: string;
  results?: SearchResults;
  recent: string[];
  isLoading: boolean;
  isError: boolean;
  onRecentSelect: (query: string) => void;
  onRecentRemove: (query: string) => void;
  className?: string;
}

export function LiveSearchPanel({
  query,
  results,
  recent,
  isLoading,
  isError,
  onRecentSelect,
  onRecentRemove,
  className,
}: LiveSearchPanelProps) {
  const trimmed = query.trim();
  const showRecent = !trimmed && recent.length > 0;
  const showResults = trimmed.length >= 2;
  const total = results?.totalCount ?? 0;

  if (!showRecent && !showResults) return null;

  return (
    <div
      className={`absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-line/60 bg-white shadow-modal ${className ?? ""}`}
      role="listbox"
      aria-label="Search suggestions"
    >
      {showRecent && (
        <div className="p-3">
          <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Recent</p>
          <ul className="space-y-1">
            {recent.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRecentSelect(item)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[14px] text-ink transition-colors hover:bg-cream"
                >
                  <Clock className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
                  <span className="truncate">{item}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRecentRemove(item)}
                  className="shrink-0 rounded px-2 py-1 text-[11px] text-ink-muted hover:text-ink"
                  aria-label={`Remove ${item} from recent searches`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showResults && (
        <div className="p-3">
          {isLoading && (
            <p className="flex items-center gap-2 px-2 py-4 text-[14px] text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Searching…
            </p>
          )}

          {isError && !isLoading && (
            <p className="px-2 py-4 text-[14px] text-ink-secondary">Search is briefly unavailable.</p>
          )}

          {!isLoading && !isError && total === 0 && (
            <p className="px-2 py-4 text-[14px] text-ink-secondary">No matches for &ldquo;{trimmed}&rdquo;.</p>
          )}

          {!isLoading && !isError && results && total > 0 && (
            <>
              <ul className="max-h-[320px] space-y-1 overflow-y-auto">
                {results.packages.slice(0, 4).map((pkg) => (
                  <li key={pkg.slug}>
                    <Link
                      href={packageDetailPath(pkg.slug)}
                      className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-cream"
                    >
                      <Package className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-medium text-ink">{pkg.title}</span>
                        <span className="block truncate text-[12px] text-ink-muted">
                          {pkg.destination} · from {formatINR(pkg.pricing.perAdult)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
                {results.destinations.slice(0, 3).map((dest) => (
                  <li key={dest.slug}>
                    <Link
                      href={dest.slug === "andaman" ? "/andaman" : `/destinations/${dest.slug}`}
                      className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-cream"
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-medium text-ink">{dest.name}</span>
                        <span className="block truncate text-[12px] text-ink-muted">{dest.tagline}</span>
                      </span>
                    </Link>
                  </li>
                ))}
                {results.guides.slice(0, 2).map((guide) => (
                  <li key={guide.slug}>
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-cream"
                    >
                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-medium text-ink">{guide.title}</span>
                        <span className="block truncate text-[12px] text-ink-muted">{guide.category}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={searchPath(trimmed)}
                className="mt-2 block rounded-lg px-2 py-2.5 text-center text-[13px] font-semibold text-teal hover:bg-teal/5"
              >
                View all {total} result{total === 1 ? "" : "s"} for &ldquo;{trimmed}&rdquo;
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
