"use client";

import type { PaginatedBookings } from "../types";
import { formatBookingDate, formatBookingMoney } from "../utils";
import { BookingStatusBadge, PaymentStatusBadge } from "./BookingStatusBadge";
import { WidgetEmpty, WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

interface BookingsTableProps {
  data?: PaginatedBookings;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onSelect: (id: string) => void;
  page: number;
  onPageChange: (page: number) => void;
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
}: BookingsTableProps) {
  if (isLoading) return <WidgetLoading label="Loading bookings…" />;
  if (isError) return <WidgetError message={errorMessage ?? "Failed to load bookings"} onRetry={onRetry} />;
  if (!data?.items.length) return <WidgetEmpty message="No bookings match your filters" />;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Booking #</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Package</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Travel date</th>
              <th className="px-6 py-4 font-semibold">Amount paid</th>
              <th className="px-6 py-4 font-semibold">Payment</th>
              <th className="px-6 py-4 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onSelect(booking.id)}
              >
                <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{booking.bookingNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.customerLabel}</td>
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground max-w-[160px] truncate" title={booking.packageLabel}>
                  {booking.packageLabel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <BookingStatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground" title="No travelDate on Booking model">
                  {booking.travelDate ? formatBookingDate(booking.travelDate) : "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap tabular-nums">
                  {formatBookingMoney(booking.amountPaid, booking.currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PaymentStatusBadge status={booking.paymentStatus} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatBookingDate(booking.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-border text-sm">
        <span className="text-muted-foreground">
          Page {data.page} of {data.totalPages} · {data.total} total
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
            disabled={page >= data.totalPages}
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
