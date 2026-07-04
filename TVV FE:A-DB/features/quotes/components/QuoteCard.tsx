import type { QuoteSummary } from "../types";

interface QuoteCardProps {
  quote: QuoteSummary;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-teal">Quote request</p>
          <p className="mt-1 font-display text-[18px] text-ink">{quote.title || quote.quoteNumber}</p>
          <p className="mt-1 text-[12px] text-ink-muted">
            Submitted{" "}
            {new Date(quote.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="rounded-full bg-ink/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-secondary">
          {quote.status}
        </span>
      </div>
    </div>
  );
}
