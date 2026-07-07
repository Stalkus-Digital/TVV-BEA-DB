"use client";

import {
  Calendar,
  CreditCard,
  FileText,
  Inbox,
  MapPin,
  PackageSearch,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { WidgetError, WidgetLoading } from "./WidgetState";

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

function formatCount(value: number | undefined): string {
  if (value === undefined) return "—";
  return value.toLocaleString("en-IN");
}

function formatCurrency(amount: number | undefined, currency: string): string {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

interface KpiGridProps {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  data?: {
    totalCustomers: number;
    totalEnquiries: number;
    totalQuotes: number;
    totalBookings: number;
    activePackages: number;
    inventoryCount: number;
    activeDestinations: number;
    revenueCollected: number;
    revenueCurrency: string;
  };
}

export function KpiGrid({ isLoading, isError, errorMessage, onRetry, data }: KpiGridProps) {
  const cards = [
    { title: "Total Customers", value: formatCount(data?.totalCustomers), hint: "All registered accounts", icon: Users },
    { title: "Total Enquiries", value: formatCount(data?.totalEnquiries), icon: Inbox },
    { title: "Total Quotes", value: formatCount(data?.totalQuotes), icon: FileText },
    { title: "Total Bookings", value: formatCount(data?.totalBookings), icon: Calendar },
    { title: "Active Packages", value: formatCount(data?.activePackages), hint: "Published packages", icon: PackageSearch },
    { title: "Inventory Count", value: formatCount(data?.inventoryCount), icon: Warehouse },
    { title: "Active Destinations", value: formatCount(data?.activeDestinations), icon: MapPin },
    {
      title: "Revenue Collected",
      value: formatCurrency(data?.revenueCollected, data?.revenueCurrency ?? "INR"),
      hint: "Manual payments · gateway integration pending",
      icon: CreditCard,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <KpiCard
          key={card.title}
          title={card.title}
          value={card.value}
          hint={card.hint}
          icon={card.icon}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}
