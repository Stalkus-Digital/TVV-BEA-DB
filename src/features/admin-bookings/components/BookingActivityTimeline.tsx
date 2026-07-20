"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, User, CheckCircle2, AlertCircle, FileText, CreditCard, Users } from "lucide-react";
import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import type { PaginatedResult } from "@/lib/admin-api/types";

export type BookingActivityCategoryFilter =
  | "all"
  | "status"
  | "payments"
  | "notes"
  | "documents"
  | "travellers"
  | "emails"
  | "system";

interface BookingActivityEvent {
  id: string;
  category: Exclude<BookingActivityCategoryFilter, "all">;
  title: string;
  subtitle: string | null;
  actorUserId: string | null;
  occurredAt: string;
  source: string;
  eventType: string | null;
  metadata: Record<string, unknown> | null;
}

const FILTERS: { id: BookingActivityCategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "status", label: "Status" },
  { id: "payments", label: "Payments" },
  { id: "notes", label: "Notes" },
  { id: "documents", label: "Documents" },
  { id: "travellers", label: "Travellers" },
  { id: "emails", label: "Emails" },
  { id: "system", label: "System" },
];

interface BookingActivityTimelineProps {
  bookingId: string;
}

/**
 * Unified booking activity feed — server-built from audit + domain sources.
 * Reuses EntityActivityTimeline visual language (icon row, relative time, actor).
 */
export function BookingActivityTimeline({ bookingId }: BookingActivityTimelineProps) {
  const [category, setCategory] = useState<BookingActivityCategoryFilter>("all");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "booking-activity", bookingId, category],
    queryFn: async () => {
      const result = await adminApiClient.get<PaginatedResult<BookingActivityEvent>>(
        `${adminEndpoints.bookings}/${bookingId}/activity`,
        { params: { category, page: 1, pageSize: 50 } }
      );
      return result?.items ?? [];
    },
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setCategory(filter.id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              category === filter.id
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-8 space-y-2">
          <p className="text-sm text-muted-foreground">Failed to load activity</p>
          <button type="button" onClick={() => void refetch()} className="text-xs text-primary hover:underline">
            Retry
          </button>
        </div>
      ) : !data?.length ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No activity recorded yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Status changes, payments, notes, and documents will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((entry, index) => {
            const timestamp = new Date(entry.occurredAt);
            const details = entry.metadata ?? {};
            const icon = categoryIcon(entry.category);

            return (
              <div key={entry.id} className="flex gap-4 pb-4 border-b border-border last:border-b-0">
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-full bg-muted">{icon}</div>
                  {index < data.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{entry.title}</span>
                    <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {entry.category}
                    </span>
                    {entry.actorUserId && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {entry.actorUserId.slice(0, 8)}…
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-1" title={timestamp.toLocaleString()}>
                    {getRelativeTime(timestamp)}
                  </p>

                  {entry.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-3 whitespace-pre-wrap">{entry.subtitle}</p>
                  )}

                  {(() => {
                    const changes = details.changes;
                    if (changes && typeof changes === "object" && Object.keys(changes).length > 0) {
                      return (
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          {Object.entries(changes as Record<string, { from?: unknown; to?: unknown }>).map(
                            ([key, change]) => (
                              <p key={key}>
                                <span className="font-medium">{key}:</span> {String(change?.from ?? "—")} →{" "}
                                {String(change?.to ?? "—")}
                              </p>
                            )
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function categoryIcon(category: string) {
  switch (category) {
    case "payments":
      return <CreditCard className="w-4 h-4 text-emerald-600" />;
    case "documents":
      return <FileText className="w-4 h-4 text-blue-600" />;
    case "travellers":
      return <Users className="w-4 h-4 text-violet-600" />;
    case "status":
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case "notes":
      return <FileText className="w-4 h-4 text-amber-600" />;
    case "emails":
      return <Clock className="w-4 h-4 text-sky-600" />;
    default:
      return <AlertCircle className="w-4 h-4 text-slate-600" />;
  }
}

function getRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
