"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { useToast } from "@/features/admin-destinations/hooks/useToast";
import { ToastContainer } from "@/features/admin-destinations/components/ToastContainer";
import { BookingCreateDialog } from "./BookingCreateDialog";
import { BookingDetailDrawer } from "./BookingDetailDrawer";
import { BookingFiltersBar } from "./BookingFiltersBar";
import { BookingsTable } from "./BookingsTable";
import { useBookingsQueryState } from "../hooks/useBookingsQuery";
import type { BookingListFilters } from "../types";
import {
  hasItemKindToProductTab,
  productTabToHasItemKind,
  type BookingProductTab,
} from "../utils";

const PRODUCT_TABS: { id: BookingProductTab; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "HOTEL", label: "Hotel" },
  { id: "PACKAGE", label: "Holiday" },
  { id: "ACTIVITY", label: "Activity" },
];

export interface BookingsPageProps {
  title?: string;
  description?: string;
  /** Locks product filter (used by /bookings/hotels|holidays|activities). */
  lockedProductTab?: BookingProductTab;
}

export function BookingsPage({
  title = "All Bookings",
  description = "Manage customer bookings, travellers, payments, and lifecycle status.",
  lockedProductTab,
}: BookingsPageProps) {
  const searchParams = useSearchParams();
  const toast = useToast();
  const initialTab = lockedProductTab ?? "ALL";

  const [filters, setFilters] = useState<BookingListFilters>({
    page: 1,
    pageSize: 20,
    sortBy: "createdAt",
    sortDir: "desc",
    hasItemKind: productTabToHasItemKind(initialTab),
  });
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("selected"));
  const [createOpen, setCreateOpen] = useState(false);
  const [productTab, setProductTab] = useState<BookingProductTab>(initialTab);
  const debouncedSearch = useDebouncedValue(searchInput);

  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected) setSelectedId(selected);
  }, [searchParams]);

  const queryFilters: BookingListFilters = {
    ...filters,
    search: debouncedSearch,
    hasItemKind: productTabToHasItemKind(productTab),
  };
  const bookingsQuery = useBookingsQueryState(queryFilters);

  const setProductFilter = (tab: BookingProductTab) => {
    if (lockedProductTab) return;
    setProductTab(tab);
    setFilters((current) => ({
      ...current,
      page: 1,
      hasItemKind: productTabToHasItemKind(tab),
    }));
  };

  return (
    <div className="space-y-0 -m-6 flex flex-col min-h-[calc(100vh-6rem)]">
      <ToastContainer />
      <div className="p-6 border-b border-border bg-card shrink-0 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create booking
          </button>
        </div>
        <BookingFiltersBar
          filters={filters}
          searchInput={searchInput}
          onSearchChange={(value) => {
            setSearchInput(value);
            setFilters((current) => ({ ...current, page: 1 }));
          }}
          onFiltersChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
          onRefresh={() => void bookingsQuery.refetch()}
          isRefreshing={bookingsQuery.isFetching}
          customers={bookingsQuery.users ?? []}
        />
      </div>

      {!lockedProductTab && (
        <div className="flex px-6 border-b border-border bg-card">
          {PRODUCT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setProductFilter(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                productTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 bg-card border-t border-border">
        <BookingsTable
          data={bookingsQuery.data}
          isLoading={bookingsQuery.isLoading}
          isError={bookingsQuery.isError}
          errorMessage={bookingsQuery.error instanceof Error ? bookingsQuery.error.message : undefined}
          onRetry={() => void bookingsQuery.refetch()}
          onSelect={setSelectedId}
          page={filters.page ?? 1}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          productTab={hasItemKindToProductTab(queryFilters.hasItemKind) || productTab}
        />
      </div>

      <BookingDetailDrawer
        bookingId={selectedId}
        users={bookingsQuery.users ?? []}
        bundle={bookingsQuery.bundle}
        onClose={() => setSelectedId(null)}
        onToast={(type, title, message) => {
          if (type === "success") toast.success(title, message);
          else if (type === "error") toast.error(title, message);
          else toast.info(title, message);
        }}
      />

      <BookingCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(bookingId) => {
          toast.success("Booking created", "Converted from approved quote.");
          setSelectedId(bookingId);
        }}
      />
    </div>
  );
}
