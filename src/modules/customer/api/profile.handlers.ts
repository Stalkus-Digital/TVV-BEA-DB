import { err, type Result } from "@/shared/types";
import { UnauthorizedError, type AppError } from "@/shared/errors";
import type { AuthContext } from "@/modules/auth";
import { getCustomerProfileService } from "../module";
import type { CustomerFullProfile } from "../services/customer-profile.service";

export async function getProfileHandler(context: AuthContext | null): Promise<Result<CustomerFullProfile, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getCustomerProfileService().getFullProfile(context.userId);
}

export async function updateProfileHandler(context: AuthContext | null, body: unknown): Promise<Result<CustomerFullProfile, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getCustomerProfileService().updateFullProfile(context.userId, body);
}
