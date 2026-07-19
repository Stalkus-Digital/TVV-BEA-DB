import type { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/api";
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
  const amount = typeof (body as any)?.amount === "number" ? (body as any).amount : undefined;
  const reason = typeof (body as any)?.reason === "string" ? (body as any).reason : undefined;

  const result = await getPaymentService().refund(id, { amount, reason });
  if (isErr(result)) return jsonError(result.error);
  return jsonSuccess(result.value);
}
