"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { BookingCreateDialog } from "./BookingCreateDialog";
import { BookingDetailDrawer } from "./BookingDetailDrawer";
import { BookingFiltersBar } from "./BookingFiltersBar";
import { BookingsTable } from "./BookingsTable";
import { useBookingsQueryState } from "../hooks/useBookingsQuery";
import type { BookingListFilters } from "../types";

export function BookingsPage() {
  const [filters, setFilters] = useState<BookingListFilters>({
    page: 1,
    pageSize: 20,
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "HOTEL" | "PACKAGE" | "ACTIVITY">("ALL");
  const debouncedSearch = useDebouncedValue(searchInput);

  const queryFilters: BookingListFilters = { ...filters, search: debouncedSearch };
  const bookingsQuery = useBookingsQueryState(queryFilters);
  const { deleteBooking } = require("../api/bookings");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    setIsDeleting(id);
    try {
      await deleteBooking(id);
      await bookingsQuery.refetch();
    } catch (e: any) {
      alert("Failed to delete booking: " + e.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleVoucher = async (id: string) => {
    const { generateVoucher } = require("../api/bookings");
    try {
      const res = await generateVoucher(id);
      alert(`Voucher ${res.voucherNumber} generated successfully!`);
    } catch (e: any) {
      alert("Failed to generate voucher: " + e.message);
    }
  };

  return (
    <div className="space-y-0 -m-6 flex flex-col min-h-[calc(100vh-6rem)]">
      <div className="p-6 border-b border-border bg-card shrink-0 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage customer bookings, travellers, payments, and lifecycle status.
          </p>
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
          onCreate={() => setCreateOpen(true)}
          isRefreshing={bookingsQuery.isFetching}
        />
      </div>

      <div className="flex px-6 border-b border-border bg-card">
        {([
          { id: "ALL", label: "All" },
          { id: "HOTEL", label: "Hotel" },
          { id: "PACKAGE", label: "Holiday" },
          { id: "ACTIVITY", label: "Activity" },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-card">
        <BookingsTable
          data={bookingsQuery.data}
          isLoading={bookingsQuery.isLoading}
          isError={bookingsQuery.isError}
          errorMessage={bookingsQuery.error instanceof Error ? bookingsQuery.error.message : undefined}
          onRetry={() => void bookingsQuery.refetch()}
          onSelect={setSelectedId}
          page={filters.page ?? 1}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          onEdit={setSelectedId}
          onDelete={handleDelete}
          onVoucher={handleVoucher}
          isDeleting={isDeleting}
          activeTab={activeTab}
        />
      </div>

      <BookingDetailDrawer
        bookingId={selectedId}
        users={bookingsQuery.users ?? []}
        bundle={bookingsQuery.bundle}
        onClose={() => setSelectedId(null)}
      />

      <BookingCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(bookingId) => setSelectedId(bookingId)}
      />
    </div>
  );
}
