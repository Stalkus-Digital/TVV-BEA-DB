"use client";

import type { BookingStatus, PaymentStatus } from "../types";
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "../constants";

const BOOKING_STYLES: Record<BookingStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PARTIALLY_PAID: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  TICKETED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-900",
  CANCELLED: "bg-red-100 text-red-800",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  PARTIAL: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  REFUNDED: "bg-blue-100 text-blue-800",
  FAILED: "bg-red-100 text-red-800",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${BOOKING_STYLES[status]}`}>
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STYLES[status]}`}>
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
