import type { Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import type { AuthContext } from "@/modules/auth";
import type { Enquiry } from "../types/enquiry";
import { getEnquiryService } from "../module";

/**
 * Public endpoint — `context` is legitimately `null` for an anonymous
 * visitor, and that's fine here (unlike every other handler in this
 * module): an enquiry can be submitted by anyone. When a session *is*
 * present, its `userId` is attached automatically, never trusted from the
 * request body.
 */
export async function submitEnquiryHandler(context: AuthContext | null, body: unknown): Promise<Result<Enquiry, AppError>> {
  return getEnquiryService().submit(body, context?.userId ?? null);
}
