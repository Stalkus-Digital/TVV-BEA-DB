/** Booking customer-email events (Phase 1 — email only). */

export const BookingEmailEvent = {
  BOOKING_CREATED: "BOOKING_CREATED",
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  REFUND_PROCESSED: "REFUND_PROCESSED",
  INVOICE_GENERATED: "INVOICE_GENERATED",
  VOUCHER_GENERATED: "VOUCHER_GENERATED",
} as const;

export type BookingEmailEvent = (typeof BookingEmailEvent)[keyof typeof BookingEmailEvent];

export const BookingEmailTemplateId = {
  BOOKING_CREATED: "BOOKING_CREATED",
  BOOKING_CONFIRMATION: "BOOKING_CONFIRMATION",
  BOOKING_CANCELLATION: "BOOKING_CANCELLATION",
  PAYMENT_CONFIRMATION: "PAYMENT_CONFIRMATION",
  REFUND_CONFIRMATION: "REFUND_CONFIRMATION",
  INVOICE_READY: "INVOICE_READY",
  VOUCHER_READY: "VOUCHER_READY",
} as const;

export type BookingEmailTemplateId =
  (typeof BookingEmailTemplateId)[keyof typeof BookingEmailTemplateId];

export const EmailDispatchStatus = {
  QUEUED: "QUEUED",
  SENT: "SENT",
  FAILED: "FAILED",
  SKIPPED: "SKIPPED",
} as const;

export type EmailDispatchStatus = (typeof EmailDispatchStatus)[keyof typeof EmailDispatchStatus];

export interface BookingEmailPayload {
  bookingId: string;
  bookingNumber: string;
  recipientName?: string | null;
  recipientEmail?: string | null;
  currency?: string;
  amount?: number;
  invoiceNumber?: string;
  voucherNumber?: string;
  reason?: string | null;
}

export interface EnqueueBookingEmailInput {
  event: BookingEmailEvent;
  bookingId: string;
  actorUserId?: string | null;
  /** Admin explicit resend — bypasses dedupe with a new key and audits EMAIL_RETRIED. */
  forceRetry?: boolean;
  /** Override default `${event}:${bookingId}:EMAIL` (use for payments with paymentId). */
  dedupeKey?: string;
  amount?: number;
  currency?: string;
  invoiceNumber?: string;
  voucherNumber?: string;
  reason?: string | null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidRecipientEmail(value: string | null | undefined): value is string {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

/** Soft opt-out when customer profile preferences mark transactional email off. */
export function isTransactionalEmailOptedOut(preferences: unknown): boolean {
  if (!preferences || typeof preferences !== "object") return false;
  const p = preferences as Record<string, unknown>;
  if (p.emailOptOut === true) return true;
  if (p.optOutEmails === true) return true;
  if (p.transactionalEmails === false) return true;
  if (p.emailNotifications === false) return true;
  return false;
}

export function templateForBookingEmailEvent(event: BookingEmailEvent): BookingEmailTemplateId {
  switch (event) {
    case BookingEmailEvent.BOOKING_CREATED:
      return BookingEmailTemplateId.BOOKING_CREATED;
    case BookingEmailEvent.BOOKING_CONFIRMED:
      return BookingEmailTemplateId.BOOKING_CONFIRMATION;
    case BookingEmailEvent.BOOKING_CANCELLED:
      return BookingEmailTemplateId.BOOKING_CANCELLATION;
    case BookingEmailEvent.PAYMENT_RECEIVED:
      return BookingEmailTemplateId.PAYMENT_CONFIRMATION;
    case BookingEmailEvent.REFUND_PROCESSED:
      return BookingEmailTemplateId.REFUND_CONFIRMATION;
    case BookingEmailEvent.INVOICE_GENERATED:
      return BookingEmailTemplateId.INVOICE_READY;
    case BookingEmailEvent.VOUCHER_GENERATED:
      return BookingEmailTemplateId.VOUCHER_READY;
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}
