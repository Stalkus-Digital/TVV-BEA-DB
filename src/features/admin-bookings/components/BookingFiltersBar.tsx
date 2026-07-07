"use client";

import { ArrowDown, ArrowUpDown, Filter, Plus, RefreshCw, Search } from "lucide-react";
import { BookingStatus, PaymentStatus, type BookingListFilters, type BookingSortField, type SortDirection } from "../types";
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS, BookingStatus as BookingStatusEnum, PaymentStatus as PaymentStatusEnum } from "../constants";

const SORT_OPTIONS: { value: BookingSortField; label: string }[] = [
  { value: "createdAt", label: "Created date" },
  { value: "bookingNumber", label: "Booking number" },
  { value: "status", label: "Status" },
  { value: "paymentStatus", label: "Payment status" },
  { value: "totalAmount", label: "Total amount" },
  { value: "amountPaid", label: "Amount paid" },
];

interface BookingFiltersBarProps {
  filters: BookingListFilters;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onFiltersChange: (patch: Partial<BookingListFilters>) => void;
  onRefresh: () => void;
  onCreate: () => void;
  isRefreshing?: boolean;
}

export function BookingFiltersBar({
  filters,
  searchInput,
  onSearchChange,
  onFiltersChange,
  onRefresh,
  onCreate,
  isRefreshing,
}: BookingFiltersBarProps) {
  const sortDir: SortDirection = filters.sortDir ?? "desc";

  return (
    <div className="p-4 border-b border-border flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search booking #, quote #…"
            className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create booking
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={filters.status ?? ""}
          onChange={(e) => onFiltersChange({ status: (e.target.value as BookingStatus) || undefined, page: 1 })}
          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {Object.values(BookingStatusEnum).map((status) => (
            <option key={status} value={status}>
              {BOOKING_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <select
          value={filters.paymentStatus ?? ""}
          onChange={(e) => onFiltersChange({ paymentStatus: (e.target.value as PaymentStatus) || undefined, page: 1 })}
          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
        >
          <option value="">All payment statuses</option>
          {Object.values(PaymentStatusEnum).map((status) => (
            <option key={status} value={status}>
              {PAYMENT_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(e) => onFiltersChange({ dateFrom: e.target.value || undefined, page: 1 })}
          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
          aria-label="From date"
        />
        <input
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(e) => onFiltersChange({ dateTo: e.target.value || undefined, page: 1 })}
          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
          aria-label="To date"
        />
        <ArrowUpDown className="h-4 w-4 text-muted-foreground ml-1" />
        <select
          value={filters.sortBy ?? "createdAt"}
          onChange={(e) => onFiltersChange({ sortBy: e.target.value as BookingSortField, page: 1 })}
          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onFiltersChange({ sortDir: sortDir === "asc" ? "desc" : "asc", page: 1 })}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          <ArrowDown className={`h-4 w-4 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />
          {sortDir === "asc" ? "Asc" : "Desc"}
        </button>
      </div>
    </div>
  );
}
