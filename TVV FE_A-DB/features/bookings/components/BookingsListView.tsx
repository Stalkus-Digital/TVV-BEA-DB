"use client";

import Link from "next/link";
import { BookingCard } from "./BookingCard";
import { useBookingsQuery } from "../hooks/useBookingsQuery";
import { bookingsListPath } from "../paths";

export function BookingsListView() {
  const { data, isLoading, isError, error } = useBookingsQuery();
  const bookings = data?.items ?? [];

  return (
    <>
      <h1 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight tracking-tight text-ink">
        My bookings
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
        Everything booked through The Vacation Voice, in one place.
      </p>

      {isError && (
        <div className="mt-6 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error instanceof Error ? error.message : "Failed to load bookings"}
        </div>
      )}

      {isLoading && <p className="mt-8 text-[14px] text-ink-muted">Loading your bookings…</p>}

      {!isLoading && !isError && bookings.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-white p-8 text-center">
          <p className="font-display text-[20px] text-ink">No bookings yet.</p>
          <p className="mt-2 text-[14px] text-ink-secondary">
            When you book a holiday, hotel, or ferry, it will appear here.
          </p>
          <Link
            href="/packages/domestic"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-teal px-7 text-[13px] font-bold uppercase tracking-wider text-white transition hover:bg-teal-hover"
          >
            Browse packages
          </Link>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="mt-8 space-y-3">
          {bookings.map((booking) => (
            <BookingCard key={`${booking.kind}:${booking.id}`} booking={booking} />
          ))}
        </div>
      )}
    </>
  );
}
