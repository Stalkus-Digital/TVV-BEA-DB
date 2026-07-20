"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { adminApiClient } from "@/lib/admin-api/client";
import type { PaginatedResult } from "@/lib/admin-api/types";

interface AuditEntry {
  id: string;
  eventType: string;
  actorUserId: string | null;
  details: Record<string, unknown> | null;
  occurredAt: string;
}

interface EntityActivityTimelineProps {
  /** Full audit-log endpoint for the entity, e.g. `/api/inventory/{id}/audit-logs` */
  endpoint: string;
  /** Event-type prefix stripped for display, e.g. "INVENTORY_" renders INVENTORY_PUBLISHED as "Published" */
  eventPrefix: string;
  /** React Query cache key discriminator (entity id) */
  queryKey: (string | null)[];
}

const LABELS: Record<string, string> = {
  CREATED: "Created",
  UPDATED: "Updated",
  PUBLISHED: "Published",
  UNPUBLISHED: "Unpublished",
  ARCHIVED: "Archived",
  RESTORED: "Restored",
  DUPLICATED: "Duplicated",
  DELETED: "Deleted",
};

export function EntityActivityTimeline({ endpoint, eventPrefix, queryKey }: EntityActivityTimelineProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "audit-timeline", ...queryKey],
    queryFn: async () => {
      const result = await adminApiClient.get<PaginatedResult<AuditEntry>>(endpoint, {
        params: { page: 1, pageSize: 50 },
      });
      return result?.items ?? [];
    },
    staleTime: 1000 * 60,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground">No activity recorded yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Operations like publish, archive, and edits will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((entry, index) => {
        const details = (entry.details ?? {}) as Record<string, unknown>;
        const suffix = entry.eventType.startsWith(eventPrefix)
          ? entry.eventType.slice(eventPrefix.length)
          : entry.eventType;
        const label = LABELS[suffix] ?? suffix;
        const timestamp = new Date(entry.occurredAt);

        const icon =
          suffix === "PUBLISHED" || suffix === "RESTORED" ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : suffix === "ARCHIVED" || suffix === "DELETED" ? (
            <AlertCircle className="w-4 h-4 text-amber-600" />
          ) : (
            <Clock className="w-4 h-4 text-blue-600" />
          );

        return (
          <div key={entry.id ?? index} className="flex gap-4 pb-4 border-b border-border last:border-b-0">
            <div className="flex flex-col items-center">
              <div className="p-2 rounded-full bg-muted">{icon}</div>
              {index < data.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{label}</span>
                {details.bulk === true && (
                  <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Bulk
                  </span>
                )}
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

              {typeof details.action === "string" && (
                <p className="text-xs text-muted-foreground mt-1">{String(details.action)}</p>
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
  );
}

function getRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
