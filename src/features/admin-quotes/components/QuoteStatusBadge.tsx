"use client";

import type { QuoteStatus } from "../types";
import { QUOTE_STATUS_LABELS } from "../constants";

const STATUS_STYLES: Record<QuoteStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SENT: "bg-blue-100 text-blue-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  CONVERTED: "bg-purple-100 text-purple-800",
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {QUOTE_STATUS_LABELS[status]}
    </span>
  );
}
