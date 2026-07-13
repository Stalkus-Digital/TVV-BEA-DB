"use client";

import type { PaginatedBookings } from "../types";
import { formatBookingDate, formatBookingMoney } from "../utils";
import { BookingStatusBadge, PaymentStatusBadge } from "./BookingStatusBadge";
import { WidgetEmpty, WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";
import { Eye, MoreVertical } from "lucide-react";

interface BookingsTableProps {
  data?: PaginatedBookings;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onSelect: (id: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onVoucher: (id: string) => void;
  isDeleting?: string | null;
  activeTab?: "HOTEL" | "PACKAGE" | "ACTIVITY";
}

export function BookingsTable({
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onSelect,
  page,
  onPageChange,
  onEdit,
  onDelete,
  onVoucher,
  isDeleting,
  activeTab = "PACKAGE",
}: BookingsTableProps) {
  if (isLoading) return <WidgetLoading label="Loading bookings…" />;
  if (isError) return <WidgetError message={errorMessage ?? "Failed to load bookings"} onRetry={onRetry} />;
  const filteredItems = data?.items.filter((booking) => {
    try {
      const notes = booking.internalNotes ? JSON.parse(booking.internalNotes) : {};
      const type = notes.externalBookingType || "PACKAGE";
      return type === activeTab;
    } catch {
      return activeTab === "PACKAGE";
    }
  }) || [];

  if (!filteredItems.length) return <WidgetEmpty message="No bookings match your filters" />;

  const renderTableHeaders = () => {
    if (activeTab === "HOTEL") {
      return (
        <tr>
          <th className="px-6 py-4 font-semibold">ID</th>
          <th className="px-6 py-4 font-semibold">Contact Name</th>
          <th className="px-6 py-4 font-semibold">Email</th>
          <th className="px-6 py-4 font-semibold">Phone</th>
          <th className="px-6 py-4 font-semibold">Total</th>
          <th className="px-6 py-4 font-semibold">Guests</th>
          <th className="px-6 py-4 font-semibold">Rooms</th>
          <th className="px-6 py-4 font-semibold">Check In</th>
          <th className="px-6 py-4 font-semibold">Check Out</th>
          <th className="px-6 py-4 font-semibold">Hotel</th>
          <th className="px-6 py-4 font-semibold">Room</th>
          <th className="px-6 py-4 font-semibold">Status</th>
          <th className="px-6 py-4 font-semibold text-right">Action</th>
        </tr>
      );
    } else if (activeTab === "ACTIVITY") {
      return (
        <tr>
          <th className="px-6 py-4 font-semibold">ID</th>
          <th className="px-6 py-4 font-semibold">Name</th>
          <th className="px-6 py-4 font-semibold">Email</th>
          <th className="px-6 py-4 font-semibold">Phone</th>
          <th className="px-6 py-4 font-semibold">Guest Count</th>
          <th className="px-6 py-4 font-semibold">Total</th>
          <th className="px-6 py-4 font-semibold">Start Date</th>
          <th className="px-6 py-4 font-semibold">Activity</th>
          <th className="px-6 py-4 font-semibold">Location</th>
          <th className="px-6 py-4 font-semibold">Status</th>
          <th className="px-6 py-4 font-semibold text-right">Action</th>
        </tr>
      );
    } else {
      return (
        <tr>
          <th className="px-6 py-4 font-semibold">ID</th>
          <th className="px-6 py-4 font-semibold">Contact Name</th>
          <th className="px-6 py-4 font-semibold">Email</th>
          <th className="px-6 py-4 font-semibold">Phone</th>
          <th className="px-6 py-4 font-semibold">Total</th>
          <th className="px-6 py-4 font-semibold">Guests</th>
          <th className="px-6 py-4 font-semibold">Check-In</th>
          <th className="px-6 py-4 font-semibold">Package</th>
          <th className="px-6 py-4 font-semibold">Location</th>
          <th className="px-6 py-4 font-semibold">Status</th>
          <th className="px-6 py-4 font-semibold text-right">Action</th>
        </tr>
      );
    }
  };

  const renderTableRow = (booking: any) => {
    let websiteData: any = {};
    try {
      websiteData = booking.internalNotes ? JSON.parse(booking.internalNotes) : {};
    } catch {}

    const contactName = websiteData.contactName || booking.customerLabel || "—";
    const email = websiteData.email || "—";
    const phone = websiteData.phone || "—";
    const total = formatBookingMoney(booking.totalAmount || websiteData.total || 0, booking.currency);
    const guests = websiteData.guests || websiteData.guestCount || "—";

    const Actions = (
      <td className="px-6 py-4 text-right whitespace-nowrap flex gap-3 justify-end items-center relative group">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(booking.id); }}
          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(booking.id); }}
          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
          title="Update Status / Edit"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </td>
    );

    if (activeTab === "HOTEL") {
      return (
        <tr key={booking.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onSelect(booking.id)}>
          <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{booking.bookingNumber}</td>
          <td className="px-6 py-4 whitespace-nowrap">{contactName}</td>
          <td className="px-6 py-4 whitespace-nowrap">{email}</td>
          <td className="px-6 py-4 whitespace-nowrap">{phone}</td>
          <td className="px-6 py-4 whitespace-nowrap tabular-nums">{total}</td>
          <td className="px-6 py-4 whitespace-nowrap">{guests}</td>
          <td className="px-6 py-4 whitespace-nowrap">{websiteData.rooms || "—"}</td>
          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{websiteData.checkIn || "—"}</td>
          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{websiteData.checkOut || "—"}</td>
          <td className="px-6 py-4 whitespace-nowrap max-w-[160px] truncate">{websiteData.hotelName || "—"}</td>
          <td className="px-6 py-4 whitespace-nowrap">{websiteData.roomName || "—"}</td>
          <td className="px-6 py-4 whitespace-nowrap"><BookingStatusBadge status={booking.status} /></td>
          {Actions}
        </tr>
      );
    } else if (activeTab === "ACTIVITY") {
      return (
        <tr key={booking.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onSelect(booking.id)}>
          <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{booking.bookingNumber}</td>
          <td className="px-6 py-4 whitespace-nowrap">{contactName}</td>
          <td className="px-6 py-4 whitespace-nowrap">{email}</td>
          <td className="px-6 py-4 whitespace-nowrap">{phone}</td>
          <td className="px-6 py-4 whitespace-nowrap">{guests}</td>
          <td className="px-6 py-4 whitespace-nowrap tabular-nums">{total}</td>
          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{websiteData.startDate || "—"}</td>
          <td className="px-6 py-4 whitespace-nowrap max-w-[160px] truncate">{websiteData.activityName || "—"}</td>
          <td className="px-6 py-4 whitespace-nowrap">{websiteData.location || "—"}</td>
          <td className="px-6 py-4 whitespace-nowrap"><BookingStatusBadge status={booking.status} /></td>
          {Actions}
        </tr>
      );
    } else {
      return (
        <tr key={booking.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onSelect(booking.id)}>
          <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{booking.bookingNumber}</td>
          <td className="px-6 py-4 whitespace-nowrap">{contactName}</td>
          <td className="px-6 py-4 whitespace-nowrap">{email}</td>
          <td className="px-6 py-4 whitespace-nowrap">{phone}</td>
          <td className="px-6 py-4 whitespace-nowrap tabular-nums">{total}</td>
          <td className="px-6 py-4 whitespace-nowrap">{guests}</td>
          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{websiteData.checkIn || "—"}</td>
          <td className="px-6 py-4 whitespace-nowrap max-w-[160px] truncate">{websiteData.packageName || booking.packageLabel || "—"}</td>
          <td className="px-6 py-4 whitespace-nowrap">{websiteData.location || "—"}</td>
          <td className="px-6 py-4 whitespace-nowrap"><BookingStatusBadge status={booking.status} /></td>
          {Actions}
        </tr>
      );
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
            {renderTableHeaders()}
          </thead>
          <tbody className="divide-y divide-border">
            {filteredItems.map(renderTableRow)}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-border text-sm">
        <span className="text-muted-foreground">
          Page {data?.page ?? page} of {data?.totalPages ?? 1} · {data?.total ?? 0} total
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= (data?.totalPages ?? 1)}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
