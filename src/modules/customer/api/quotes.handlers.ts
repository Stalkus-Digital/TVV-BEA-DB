import { err, type PaginationParams, type Result } from "@/shared/types";
import { UnauthorizedError, type AppError } from "@/shared/errors";
import type { AuthContext } from "@/modules/auth";
import type { Quote } from "@/modules/quote";
import type { PaginatedResult } from "@/shared/types";
import { getCustomerQuoteService } from "../module";

export async function listMyQuotesHandler(context: AuthContext | null, pagination: PaginationParams): Promise<Result<PaginatedResult<Quote>, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getCustomerQuoteService().list(context.userId, pagination);
}

export async function getMyQuoteHandler(context: AuthContext | null, id: string): Promise<Result<Quote, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getCustomerQuoteService().getById(context.userId, id);
}

export async function submitQuoteRequestHandler(context: AuthContext | null, body: unknown): Promise<Result<Quote, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getCustomerQuoteService().submitQuoteRequest(context.userId, body);
}
