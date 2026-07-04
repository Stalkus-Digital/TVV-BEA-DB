import { err, type Result } from "@/shared/types";
import { UnauthorizedError, type AppError } from "@/shared/errors";
import type { AuthContext } from "@/modules/auth";
import { getDashboardService } from "../module";
import type { CustomerDashboard } from "../dashboard/dashboard.service";

export async function getDashboardHandler(context: AuthContext | null): Promise<Result<CustomerDashboard, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getDashboardService().getDashboard(context.userId);
}
