"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { adminApiClient } from "@/lib/admin-api/client";
import type { AuditLog } from "@/modules/auth/types/audit-log";
import type { PaginatedResult } from "@/lib/admin-api/types";

interface DestinationActivityTimelineProps {
  destinationId: string;
}

export function DestinationActivityTimeline({ destinationId }: DestinationActivityTimelineProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["destination-audit-logs", destinationId],
    queryFn: async () => {
      const result = await adminApiClient.get<PaginatedResult<AuditLog>>(
        `/api/destinations/${destinationId}/audit-logs`,
        { params: { page: 1, pageSize: 50 } }
      );
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
        <p className="text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((entry, index) => {
        const details = (entry.details ?? {}) as Record<string, unknown>;
        const eventType = entry.eventType;
        const timestamp = new Date(entry.occurredAt);
        const formattedTime = timestamp.toLocaleString();
        const relativeTime = getRelativeTime(timestamp);

        const getIcon = () => {
          if (eventType.includes("PUBLISHED") || eventType.includes("RESTORED")) {
            return <CheckCircle2 className="w-4 h-4 text-green-600" />;
          }
          if (eventType.includes("ARCHIVED")) {
            return <AlertCircle className="w-4 h-4 text-amber-600" />;
          }
          return <Clock className="w-4 h-4 text-blue-600" />;
        };

        const getLabel = () => {
          switch (eventType) {
            case "DESTINATION_CREATED":
              return "Created";
            case "DESTINATION_UPDATED":
              return "Updated";
            case "DESTINATION_PUBLISHED":
              return "Published";
            case "DESTINATION_UNPUBLISHED":
              return "Unpublished";
            case "DESTINATION_ARCHIVED":
              return "Archived";
            case "DESTINATION_RESTORED":
              return "Restored";
            case "DESTINATION_DUPLICATED":
              return "Duplicated";
            default:
              return eventType.replace("DESTINATION_", "");
          }
        };

        return (
          <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-b-0">
            <div className="flex flex-col items-center">
              <div className="p-2 rounded-full bg-muted">{getIcon()}</div>
              {index < data.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{getLabel()}</span>
                {entry.actorUserId && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {entry.actorUserId.slice(0, 8)}...
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-1" title={formattedTime}>
                {relativeTime}
              </p>

              {Object.keys(details).length > 0 && (
                <div className="mt-2 text-xs text-foreground/80 space-y-1">
                  {typeof details.action === "string" && (
                    <p className="text-xs text-muted-foreground">{String(details.action)}</p>
                  )}
                  {(() => {
                    const changes = details.changes;
                    if (changes && typeof changes === "object") {
                      return (
                        <div className="text-xs text-muted-foreground">
                          {Object.entries(changes as Record<string, any>).map(([key, change]) => {
                            return (
                              <p key={key}>
                                <span className="font-medium">{key}:</span> {String(change?.from)} → {String(change?.to)}
                              </p>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}
