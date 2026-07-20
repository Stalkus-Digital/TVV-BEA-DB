"use client";

import type { BookingListRow, PaginatedBookings } from "../types";
import { formatBookingDate, formatBookingMoney, resolveBookingContact, type BookingProductTab } from "../utils";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { WidgetEmpty, WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";
import { Eye } from "lucide-react";

interface BookingsTableProps {
  data?: PaginatedBookings;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onSelect: (id: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  /** Column layout variant — driven by server product filter, not client-side tab filtering. */
  productTab?: BookingProductTab;
}

function TableSkeleton() {
  return (
    <div className="space-y-0">
      <div className="border-b border-border px-6 py-4">
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-border px-6 py-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
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
  productTab = "ALL",
}: BookingsTableProps) {
  if (isLoading) {
    return (
      <div>
        <WidgetLoading label="Loading bookings…" />
        <TableSkeleton />
      </div>
    );
  }
  if (isError) return <WidgetError message={errorMessage ?? "Failed to load bookings"} onRetry={onRetry} />;

  const items = data?.items ?? [];
  if (!items.length) {
    return <WidgetEmpty message="No bookings match your filters. Try clearing filters or create from an approved quote." />;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
            {renderHeaders(productTab)}
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((booking) => renderRow(booking, productTab, onSelect))}
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

function renderHeaders(productTab: BookingProductTab) {
  if (productTab === "HOTEL") {
    return (
      <tr>
        <th className="px-6 py-4 font-semibold">ID</th>
        <th className="px-6 py-4 font-semibold">Contact</th>
        <th className="px-6 py-4 font-semibold">Email</th>
        <th className="px-6 py-4 font-semibold">Phone</th>
        <th className="px-6 py-4 font-semibold">Total</th>
        <th className="px-6 py-4 font-semibold">Guests</th>
        <th className="px-6 py-4 font-semibold">Rooms</th>
        <th className="px-6 py-4 font-semibold">Check in</th>
        <th className="px-6 py-4 font-semibold">Check out</th>
        <th className="px-6 py-4 font-semibold">Hotel</th>
        <th className="px-6 py-4 font-semibold">Room</th>
        <th className="px-6 py-4 font-semibold">Status</th>
        <th className="px-6 py-4 font-semibold text-right">Action</th>
      </tr>
    );
  }
  if (productTab === "ACTIVITY") {
    return (
      <tr>
        <th className="px-6 py-4 font-semibold">ID</th>
        <th className="px-6 py-4 font-semibold">Name</th>
        <th className="px-6 py-4 font-semibold">Email</th>
        <th className="px-6 py-4 font-semibold">Phone</th>
        <th className="px-6 py-4 font-semibold">Guests</th>
        <th className="px-6 py-4 font-semibold">Total</th>
        <th className="px-6 py-4 font-semibold">Start date</th>
        <th className="px-6 py-4 font-semibold">Activity</th>
        <th className="px-6 py-4 font-semibold">Location</th>
        <th className="px-6 py-4 font-semibold">Status</th>
        <th className="px-6 py-4 font-semibold text-right">Action</th>
      </tr>
    );
  }
  if (productTab === "PACKAGE") {
    return (
      <tr>
        <th className="px-6 py-4 font-semibold">ID</th>
        <th className="px-6 py-4 font-semibold">Contact</th>
        <th className="px-6 py-4 font-semibold">Email</th>
        <th className="px-6 py-4 font-semibold">Phone</th>
        <th className="px-6 py-4 font-semibold">Total</th>
        <th className="px-6 py-4 font-semibold">Guests</th>
        <th className="px-6 py-4 font-semibold">Check-in</th>
        <th className="px-6 py-4 font-semibold">Package</th>
        <th className="px-6 py-4 font-semibold">Location</th>
        <th className="px-6 py-4 font-semibold">Status</th>
        <th className="px-6 py-4 font-semibold text-right">Action</th>
      </tr>
    );
  }
  return (
    <tr>
      <th className="px-6 py-4 font-semibold">ID</th>
      <th className="px-6 py-4 font-semibold">Type</th>
      <th className="px-6 py-4 font-semibold">Contact</th>
      <th className="px-6 py-4 font-semibold">Email</th>
      <th className="px-6 py-4 font-semibold">Phone</th>
      <th className="px-6 py-4 font-semibold">Total</th>
      <th className="px-6 py-4 font-semibold">Created</th>
      <th className="px-6 py-4 font-semibold">Status</th>
      <th className="px-6 py-4 font-semibold text-right">Action</th>
    </tr>
  );
}

function ActionsCell({ bookingId, onSelect }: { bookingId: string; onSelect: (id: string) => void }) {
  return (
    <td className="px-6 py-4 text-right whitespace-nowrap">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(bookingId);
        }}
        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </button>
    </td>
  );
}

function renderRow(booking: BookingListRow, productTab: BookingProductTab, onSelect: (id: string) => void) {
  const { name, email, phone, website } = resolveBookingContact(booking, booking.customerLabel);
  const total = formatBookingMoney(booking.totalAmount || website?.total || 0, booking.currency);
  const guests = website?.guests ?? website?.guestCount ?? "—";
  const itemTitle = booking.items?.[0]?.title;

  const rowProps = {
    key: booking.id,
    className: "hover:bg-muted/50 transition-colors cursor-pointer",
    onClick: () => onSelect(booking.id),
  };

  if (productTab === "HOTEL") {
    return (
      <tr {...rowProps}>
        <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{booking.bookingNumber}</td>
        <td className="px-6 py-4 whitespace-nowrap">{name}</td>
        <td className="px-6 py-4 whitespace-nowrap">{email}</td>
        <td className="px-6 py-4 whitespace-nowrap">{phone}</td>
        <td className="px-6 py-4 whitespace-nowrap tabular-nums">{total}</td>
        <td className="px-6 py-4 whitespace-nowrap">{guests}</td>
        <td className="px-6 py-4 whitespace-nowrap">{website?.rooms ?? "—"}</td>
        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{website?.checkIn ?? "—"}</td>
        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{website?.checkOut ?? "—"}</td>
        <td className="px-6 py-4 whitespace-nowrap max-w-[160px] truncate">{website?.hotelName || itemTitle || "—"}</td>
        <td className="px-6 py-4 whitespace-nowrap">{website?.roomName ?? "—"}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          <BookingStatusBadge status={booking.status} />
        </td>
        <ActionsCell bookingId={booking.id} onSelect={onSelect} />
      </tr>
    );
  }

  if (productTab === "ACTIVITY") {
    return (
      <tr {...rowProps}>
        <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{booking.bookingNumber}</td>
        <td className="px-6 py-4 whitespace-nowrap">{name}</td>
        <td className="px-6 py-4 whitespace-nowrap">{email}</td>
        <td className="px-6 py-4 whitespace-nowrap">{phone}</td>
        <td className="px-6 py-4 whitespace-nowrap">{guests}</td>
        <td className="px-6 py-4 whitespace-nowrap tabular-nums">{total}</td>
        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{website?.startDate ?? "—"}</td>
        <td className="px-6 py-4 whitespace-nowrap max-w-[160px] truncate">{website?.activityName || itemTitle || "—"}</td>
        <td className="px-6 py-4 whitespace-nowrap">{website?.location ?? "—"}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          <BookingStatusBadge status={booking.status} />
        </td>
        <ActionsCell bookingId={booking.id} onSelect={onSelect} />
      </tr>
    );
  }

  if (productTab === "PACKAGE") {
    return (
      <tr {...rowProps}>
        <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{booking.bookingNumber}</td>
        <td className="px-6 py-4 whitespace-nowrap">{name}</td>
        <td className="px-6 py-4 whitespace-nowrap">{email}</td>
        <td className="px-6 py-4 whitespace-nowrap">{phone}</td>
        <td className="px-6 py-4 whitespace-nowrap tabular-nums">{total}</td>
        <td className="px-6 py-4 whitespace-nowrap">{guests}</td>
        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{website?.checkIn ?? "—"}</td>
        <td className="px-6 py-4 whitespace-nowrap max-w-[160px] truncate">
          {website?.packageName || booking.packageLabel || itemTitle || "—"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">{website?.location ?? "—"}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          <BookingStatusBadge status={booking.status} />
        </td>
        <ActionsCell bookingId={booking.id} onSelect={onSelect} />
      </tr>
    );
  }

  const category = booking.bookingCategory ?? "PACKAGE";
  return (
    <tr {...rowProps}>
      <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{booking.bookingNumber}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {category === "HOTEL" ? "Hotel" : category === "ACTIVITY" ? "Activity" : "Holiday"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{name}</td>
      <td className="px-6 py-4 whitespace-nowrap">{email}</td>
      <td className="px-6 py-4 whitespace-nowrap">{phone}</td>
      <td className="px-6 py-4 whitespace-nowrap tabular-nums">{total}</td>
      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatBookingDate(booking.createdAt)}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <BookingStatusBadge status={booking.status} />
      </td>
      <ActionsCell bookingId={booking.id} onSelect={onSelect} />
    </tr>
  );
}
