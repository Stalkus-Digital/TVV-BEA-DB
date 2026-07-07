"use client";

import Link from "next/link";
import { QuoteCard } from "./QuoteCard";
import { useQuotesQuery } from "../hooks/useQuotesQuery";

export function QuotesListView() {
  const { data: quotes = [], isLoading, isError, error } = useQuotesQuery();

  return (
    <>
      <h1 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight tracking-tight text-ink">
        My quotes
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
        Track custom itinerary requests and proposals from your TVV specialist.
      </p>

      {isError && (
        <div className="mt-6 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error instanceof Error ? error.message : "Failed to load quotes"}
        </div>
      )}

      {isLoading && <p className="mt-8 text-[14px] text-ink-muted">Loading your quotes…</p>}

      {!isLoading && !isError && quotes.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-white p-8 text-center">
          <p className="font-display text-[20px] text-ink">No quote requests yet.</p>
          <p className="mt-2 text-[14px] text-ink-secondary">
            When you request a custom proposal, it will appear here.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-teal px-7 text-[13px] font-bold uppercase tracking-wider text-white transition hover:bg-teal-hover"
          >
            Request a proposal
          </Link>
        </div>
      )}

      {quotes.length > 0 && (
        <div className="mt-8 space-y-3">
          {quotes.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      )}
    </>
  );
}
