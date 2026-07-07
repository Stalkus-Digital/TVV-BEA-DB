import Link from "next/link";
import { formatINR } from "@/lib/utils";
import type { BookingListItem } from "../types";
import { bookingDetailPath } from "../paths";

interface BookingCardProps {
  booking: BookingListItem;
}

export function BookingCard({ booking }: BookingCardProps) {
  return (
    <Link
      href={bookingDetailPath(booking.kind, booking.id)}
      className="block rounded-lg border border-line bg-white p-5 transition hover:border-teal hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-teal">{booking.kind}</p>
          <p className="mt-1 font-display text-[18px] text-ink">{booking.title}</p>
          {booking.startDate && (
            <p className="mt-1 text-[12px] text-ink-muted">
              {new Date(booking.startDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
          {booking.totalAmount != null && booking.totalAmount > 0 && (
            <p className="mt-1 text-[12px] font-medium text-ink-secondary">{formatINR(booking.totalAmount)}</p>
          )}
        </div>
        <span className="rounded-full bg-ink/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-secondary">
          {booking.status}
        </span>
      </div>
    </Link>
  );
}
