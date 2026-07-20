import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
import { readAuthContextFromHeaders } from "@/modules/auth";
import { getPaymentService } from "@/modules/payments/module";
import { isErr } from "@/shared/types";

/**
 * PAY-001: admin-initiated refund, in full or in part. Protected by the
 * existing `/api/bookings` → BOOKING permission mapping already enforced
 * in middleware — no new permission wiring needed.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const amount = typeof (body as { amount?: unknown }).amount === "number" ? (body as { amount: number }).amount : undefined;
  const reason = typeof (body as { reason?: unknown }).reason === "string" ? (body as { reason: string }).reason : undefined;
  const context = readAuthContextFromHeaders(request.headers);

  const result = await getPaymentService().refund(id, {
    amount,
    reason,
    actorUserId: context?.userId ?? null,
  });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
