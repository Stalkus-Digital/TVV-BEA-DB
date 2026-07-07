"use client";

import type { PaginatedQuotes } from "../types";
import { formatQuoteDate, formatQuoteMoney } from "../utils";
import { QuoteStatusBadge } from "./QuoteStatusBadge";
import { WidgetEmpty, WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

interface QuotesTableProps {
  data?: PaginatedQuotes;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onSelect: (id: string) => void;
  page: number;
  onPageChange: (page: number) => void;
}

export function QuotesTable({
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onSelect,
  page,
  onPageChange,
}: QuotesTableProps) {
  if (isLoading) return <WidgetLoading label="Loading quotes…" />;
  if (isError) return <WidgetError message={errorMessage ?? "Failed to load quotes"} onRetry={onRetry} />;
  if (!data?.items.length) return <WidgetEmpty message="No quotes match your filters" />;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Quote #</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Title</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Created</th>
              <th className="px-6 py-4 font-semibold">Valid until</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Assigned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((quote) => (
              <tr
                key={quote.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onSelect(quote.id)}
              >
                <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{quote.quoteNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{quote.customerLabel}</td>
                <td className="px-6 py-4 font-medium">{quote.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <QuoteStatusBadge status={quote.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatQuoteDate(quote.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatQuoteDate(quote.validTo)}</td>
                <td className="px-6 py-4 whitespace-nowrap tabular-nums">
                  {formatQuoteMoney(quote.totalAmount, quote.currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground" title="No assigned-staff field on Quote">
                  —
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-border text-sm">
        <span className="text-muted-foreground">
          Page {data.page} of {data.totalPages} · {data.total} total
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= data.totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
