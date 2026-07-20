"use client";

import { ArrowDown, ArrowUpDown, Filter, RefreshCw, Search } from "lucide-react";
import type { PublicUser } from "@/features/admin-customers/types";
import {
  BookingStatus,
  PaymentStatus,
  type BookingListFilters,
  type BookingSortField,
  type SortDirection,
} from "../types";
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  BookingStatus as BookingStatusEnum,
  PaymentStatus as PaymentStatusEnum,
} from "../constants";

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
  isRefreshing?: boolean;
  customers?: PublicUser[];
}

export function BookingFiltersBar({
  filters,
  searchInput,
  onSearchChange,
  onFiltersChange,
  onRefresh,
  isRefreshing,
  customers = [],
}: BookingFiltersBarProps) {
  const sortDir: SortDirection = filters.sortDir ?? "desc";

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
      <div className="relative min-w-[200px] flex-1 basis-[220px] max-w-md">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search booking #, quote #, guest…"
          className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <Filter className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" aria-hidden />

      <select
        value={filters.status ?? ""}
        onChange={(e) => onFiltersChange({ status: (e.target.value as BookingStatus) || undefined, page: 1 })}
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
        aria-label="Booking status"
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
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
        aria-label="Payment status"
      >
        <option value="">All payment statuses</option>
        {Object.values(PaymentStatusEnum).map((status) => (
          <option key={status} value={status}>
            {PAYMENT_STATUS_LABELS[status]}
          </option>
        ))}
      </select>

      <select
        value={filters.customerId ?? ""}
        onChange={(e) => onFiltersChange({ customerId: e.target.value || undefined, page: 1 })}
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm max-w-[180px]"
        aria-label="Customer"
      >
        <option value="">All customers</option>
        {customers.map((user) => (
          <option key={user.id} value={user.id}>
            {user.fullName || user.email}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={filters.dateFrom ?? ""}
        onChange={(e) => onFiltersChange({ dateFrom: e.target.value || undefined, page: 1 })}
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
        aria-label="From date"
      />
      <input
        type="date"
        value={filters.dateTo ?? ""}
        onChange={(e) => onFiltersChange({ dateTo: e.target.value || undefined, page: 1 })}
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
        aria-label="To date"
      />

      <ArrowUpDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" aria-hidden />
      <select
        value={filters.sortBy ?? "createdAt"}
        onChange={(e) => onFiltersChange({ sortBy: e.target.value as BookingSortField, page: 1 })}
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
        aria-label="Sort by"
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
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm hover:bg-muted"
      >
        <ArrowDown className={`h-3.5 w-3.5 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />
        {sortDir === "asc" ? "Asc" : "Desc"}
      </button>

      <div className="ml-auto flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}
