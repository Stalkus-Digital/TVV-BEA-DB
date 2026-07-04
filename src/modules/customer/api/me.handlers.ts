import { err, type Result } from "@/shared/types";
import { UnauthorizedError, type AppError } from "@/shared/errors";
import type { AuthContext } from "@/modules/auth";
import { getCustomerProfileService } from "../module";
import type { CustomerAccount } from "../services/customer-profile.service";

export async function getMeHandler(context: AuthContext | null): Promise<Result<CustomerAccount, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getCustomerProfileService().getAccount(context.userId);
}

export async function updateMeHandler(context: AuthContext | null, body: unknown): Promise<Result<CustomerAccount, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getCustomerProfileService().updateAccount(context.userId, body);
}
