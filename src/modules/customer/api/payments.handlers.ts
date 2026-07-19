import { err, type Result } from "@/shared/types";
import { UnauthorizedError, type AppError } from "@/shared/errors";
import type { AuthContext } from "@/modules/auth";
import { getCustomerPaymentService } from "../module";
import type { CustomerPaymentItem } from "../services/customer-payment.service";

export async function listMyPaymentsHandler(
  context: AuthContext | null
): Promise<Result<CustomerPaymentItem[], AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getCustomerPaymentService().list(context.userId);
}
