"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/utils";
import type { BookingKind } from "../types";
import { useBookingDetail } from "../hooks/useBookingDetail";
import { useCancelBookingMutation } from "../hooks/useCancelBookingMutation";
import { bookingsListPath } from "../paths";

interface BookingDetailViewProps {
  kind: BookingKind;
  id: string;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line/40 py-4">
      <dt className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-muted">{label}</dt>
      <dd className="mt-1 text-[15px] text-ink">{value}</dd>
    </div>
  );
}

export function BookingDetailView({ kind, id }: BookingDetailViewProps) {
  const { data: booking, isLoading, isError, error } = useBookingDetail(kind, id);
  const cancelBooking = useCancelBookingMutation(kind, id);

  return (
    <>
      <Link href={bookingsListPath()} className="text-[13px] font-medium text-teal hover:underline">
        ← Back to bookings
      </Link>

      {isLoading && (
        <p className="mt-8 inline-flex items-center gap-2 text-[14px] text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading booking…
        </p>
      )}

      {isError && (
        <div className="mt-8 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error instanceof Error ? error.message : "Failed to load booking"}
        </div>
      )}

      {booking && (
        <div className="mt-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-teal">{booking.kind}</p>
              <h1 className="mt-2 font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight text-ink">
                {booking.title}
              </h1>
              {booking.destination && (
                <p className="mt-2 text-[14px] text-ink-secondary">{booking.destination}</p>
              )}
            </div>
            <span className="rounded-full bg-ink/5 px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.1em] text-ink-secondary">
              {booking.status}
            </span>
          </div>

          <dl className="mt-10 max-w-xl rounded-xl border border-line bg-white px-6">
            {booking.reference && <DetailRow label="Reference" value={booking.reference} />}
            {booking.startDate && (
              <DetailRow
                label="Start date"
                value={new Date(booking.startDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            )}
            {booking.endDate && (
              <DetailRow
                label="End date"
                value={new Date(booking.endDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            )}
            {booking.guests != null && <DetailRow label="Travellers" value={String(booking.guests)} />}
            {booking.totalAmount != null && booking.totalAmount > 0 && (
              <DetailRow label="Total" value={formatINR(booking.totalAmount)} />
            )}
            {booking.createdAt && (
              <DetailRow
                label="Booked on"
                value={new Date(booking.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            )}
          </dl>

          {booking.cancellable && (
            <div className="mt-8">
              <Button
                type="button"
                variant="outline"
                disabled={cancelBooking.isPending}
                onClick={() => {
                  if (window.confirm("Cancel this booking? Our team will confirm by email.")) {
                    cancelBooking.mutate();
                  }
                }}
              >
                {cancelBooking.isPending ? "Cancelling…" : "Request cancellation"}
              </Button>
              {cancelBooking.isError && (
                <p className="mt-2 text-sm text-danger">
                  {cancelBooking.error instanceof Error
                    ? cancelBooking.error.message
                    : "Could not cancel booking"}
                </p>
              )}
              {cancelBooking.isSuccess && (
                <p className="mt-2 text-sm text-teal">Cancellation request submitted.</p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
