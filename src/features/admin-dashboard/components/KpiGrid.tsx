"use client";

import {
  Activity,
  Building2,
  Calendar,
  Compass,
  CreditCard,
  FileText,
  Inbox,
  MapPin,
  MessageSquareQuote,
  Package,
  Plane,
  Ship,
  BedDouble,
  LayoutTemplate,
  Hotel,
  Percent,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import type { DashboardKpiIcon, DashboardKpis } from "@/lib/admin-api/types";
import { WidgetError, WidgetLoading } from "./WidgetState";

const ICON_MAP: Record<DashboardKpiIcon, LucideIcon> = {
  package: Package,
  building2: Building2,
  bedDouble: BedDouble,
  ship: Ship,
  plane: Plane,
  activity: Activity,
  mapPin: MapPin,
  calendar: Calendar,
  hotel: Hotel,
  compass: Compass,
  creditCard: CreditCard,
  percent: Percent,
  bookOpen: BookOpen,
  layoutTemplate: LayoutTemplate,
  inbox: Inbox,
  messageSquareQuote: MessageSquareQuote,
  fileText: FileText,
};

export interface KpiCardProps {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

export function KpiCard({ title, value, hint, icon: Icon, isLoading, isError, errorMessage, onRetry }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      {isLoading ? (
        <div className="py-4">
          <WidgetLoading />
        </div>
      ) : isError ? (
        <WidgetError message={errorMessage ?? "Failed to load"} onRetry={onRetry} />
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </>
      )}
    </div>
  );
}

interface KpiGridProps {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  data?: DashboardKpis;
}

export function KpiGrid({ isLoading, isError, errorMessage, onRetry, data }: KpiGridProps) {
  const sections = data?.sections ?? [];

  if (!isLoading && !isError && sections.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        No KPI sections returned from the API.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {(isLoading || isError ? [{ id: "loading", title: "Loading", description: "", cards: [] }] : sections).map(
        (section) => (
          <section key={section.id} className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                {isLoading || isError ? "Management KPIs" : section.title}
              </h2>
              {!isLoading && !isError && section.description && (
                <p className="text-sm text-muted-foreground">{section.description}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading || isError
                ? Array.from({ length: 4 }).map((_, index) => (
                    <KpiCard
                      key={`${section.id}-${index}`}
                      title="…"
                      value="—"
                      icon={Package}
                      isLoading={isLoading}
                      isError={isError}
                      errorMessage={errorMessage}
                      onRetry={onRetry}
                    />
                  ))
                : section.cards.map((card) => (
                    <KpiCard
                      key={card.id}
                      title={card.title}
                      value={card.value}
                      hint={card.hint}
                      icon={ICON_MAP[card.icon] ?? Package}
                      isLoading={false}
                      isError={false}
                    />
                  ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
