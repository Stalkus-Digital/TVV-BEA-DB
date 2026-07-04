import { err, ok, type Result } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { PaymentStatus } from "../types/booking-payment";

export interface RecordPaymentInput {
  amount: number;
  method: string | null;
  status: PaymentStatus;
  reference: string | null;
  notes: string | null;
}

export function validateRecordPayment(input: unknown): Result<RecordPaymentInput, ValidationError> {
  if (typeof input !== "object" || input === null) return err(new ValidationError("Request body must be an object"));
  const body = input as Record<string, unknown>;

  if (typeof body.amount !== "number" || body.amount <= 0) return err(new ValidationError("amount must be a positive number"));

  const status = (body.status as string | undefined) ?? PaymentStatus.PAID;
  if (!Object.values(PaymentStatus).includes(status as PaymentStatus)) {
    return err(new ValidationError(`status must be one of: ${Object.values(PaymentStatus).join(", ")}`));
  }
  for (const field of ["method", "reference", "notes"] as const) {
    if (body[field] !== undefined && body[field] !== null && typeof body[field] !== "string") {
      return err(new ValidationError(`${field} must be a string`));
    }
  }

  return ok({
    amount: body.amount,
    method: (body.method as string | undefined) ?? null,
    status: status as PaymentStatus,
    reference: (body.reference as string | undefined) ?? null,
    notes: (body.notes as string | undefined) ?? null,
  });
}
