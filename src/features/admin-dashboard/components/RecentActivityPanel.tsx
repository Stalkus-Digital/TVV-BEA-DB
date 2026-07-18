"use client";

import { Calendar, FileText, Inbox } from "lucide-react";
import type { ActivityItem } from "@/lib/admin-api/types";
import { WidgetEmpty, WidgetError, WidgetLoading } from "./WidgetState";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function kindLabel(kind: ActivityItem["kind"]): string {
  if (kind === "enquiry") return "Enquiry";
  if (kind === "quote") return "Quote";
  return "Booking";
}

function kindIcon(kind: ActivityItem["kind"]) {
  if (kind === "enquiry") return Inbox;
  if (kind === "quote") return FileText;
  return Calendar;
}

function statusClasses(status: string): string {
  const normalized = status.toUpperCase();
  if (["NEW", "DRAFT"].includes(normalized)) return "bg-blue-100 text-blue-700";
  if (["CONTACTED", "SENT", "CONFIRMED", "PARTIALLY_PAID"].includes(normalized)) return "bg-amber-100 text-amber-700";
  if (["APPROVED", "PAID", "PUBLISHED", "COMPLETED", "CONVERTED"].includes(normalized)) return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-700";
}

interface RecentActivityPanelProps {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  items?: ActivityItem[];
}

export function RecentActivityPanel({ isLoading, isError, errorMessage, onRetry, items = [] }: RecentActivityPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-col space-y-1.5 pb-4">
        <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest enquiries and bookings.</p>
      </div>

      {isLoading ? (
        <WidgetLoading />
      ) : isError ? (
        <WidgetError message={errorMessage ?? "Failed to load recent activity"} onRetry={onRetry} />
      ) : items.length === 0 ? (
        <WidgetEmpty message="No activity yet" />
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const Icon = kindIcon(item.kind);
            return (
              <div key={`${item.kind}-${item.id}`} className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium leading-none truncate">{item.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusClasses(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {kindLabel(item.kind)} · {item.subtitle} · {relativeTime(item.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
