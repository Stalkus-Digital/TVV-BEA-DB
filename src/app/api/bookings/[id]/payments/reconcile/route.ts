import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { getPaymentService } from "@/modules/payments/module";
import { isErr } from "@/shared/types";

/**
 * PAY-001: on-demand reconciliation between a booking's local BookingPayment
 * records and Razorpay's own view of each referenced payment. Admin-facing,
 * on-demand — no cron/scheduler is wired here (out of scope for this
 * sprint), but the capability now exists to call from an admin screen or
 * a future scheduled job.
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPaymentService().reconcilePayment(id);
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
