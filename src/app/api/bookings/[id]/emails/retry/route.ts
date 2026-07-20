import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { BookingEmailEvent, enqueueBookingEmail } from "@/modules/email";
import { ValidationError } from "@/shared/errors";

/**
 * Admin explicit email retry — bypasses dedupe for the given booking event.
 * Enqueue is fire-and-forget; audits EMAIL_RETRIED then SENT/FAILED asynchronously.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const eventRaw = typeof (body as { event?: unknown }).event === "string" ? (body as { event: string }).event : "";
  if (!Object.values(BookingEmailEvent).includes(eventRaw as (typeof BookingEmailEvent)[keyof typeof BookingEmailEvent])) {
    return jsonError(
      new ValidationError(`event must be one of: ${Object.values(BookingEmailEvent).join(", ")}`)
    );
  }

  const context = readAuthContextFromHeaders(request.headers);
  enqueueBookingEmail({
    event: eventRaw as (typeof BookingEmailEvent)[keyof typeof BookingEmailEvent],
    bookingId: id,
    actorUserId: context?.userId ?? null,
    forceRetry: true,
    amount: typeof (body as { amount?: unknown }).amount === "number" ? (body as { amount: number }).amount : undefined,
    reason: typeof (body as { reason?: unknown }).reason === "string" ? (body as { reason: string }).reason : undefined,
    invoiceNumber:
      typeof (body as { invoiceNumber?: unknown }).invoiceNumber === "string"
        ? (body as { invoiceNumber: string }).invoiceNumber
        : undefined,
    voucherNumber:
      typeof (body as { voucherNumber?: unknown }).voucherNumber === "string"
        ? (body as { voucherNumber: string }).voucherNumber
        : undefined,
  });

  return jsonSuccess({ queued: true, retried: true, event: eventRaw });
}
