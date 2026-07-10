"use client";

import { useState } from "react";
import { Receipt, Search, Filter, IndianRupee, Plus } from "lucide-react";
import { useBookingsQueryState } from "@/features/admin-bookings/hooks/useBookingsQuery";
import { BookingCreateDialog } from "@/features/admin-bookings/components/BookingCreateDialog";

export default function HotelBookingsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, refetch } = useBookingsQueryState({ search, hasItemKind: "HOTEL" });

  const hotelBookings = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hotel Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage all standalone and packaged hotel room reservations.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Booking ID or guest name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors">
              <Filter className="h-4 w-4" /> Filters
            </button>
            <button 
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors"
            >
              <Plus className="h-4 w-4" /> Create Booking
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Guest Name</th>
                <th className="px-6 py-4 font-semibold">Hotel Property</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Loading hotel bookings...
                  </td>
                </tr>
              ) : hotelBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No hotel bookings found.
                  </td>
                </tr>
              ) : (
                hotelBookings.map((booking) => {
                  const leadTraveller = booking.travellers?.find((t) => t.isLeadTraveller);
                  const hotelItem = booking.items?.find((i) => i.kind === "HOTEL");
                  return (
                    <tr key={booking.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                        {booking.bookingNumber}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                        {leadTraveller?.fullName || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-primary flex items-center gap-1.5">
                          <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                          {hotelItem?.title || "Multiple Hotels"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground">
                        <div className="flex items-center">
                          <IndianRupee className="h-3.5 w-3.5" /> {booking.totalAmount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                          booking.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button className="text-primary hover:underline font-semibold text-xs">View Voucher</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BookingCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => void refetch()}
      />
    </div>
  );
}
