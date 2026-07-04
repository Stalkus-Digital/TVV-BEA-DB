import { err, type Result } from "@/shared/types";
import { UnauthorizedError, type AppError } from "@/shared/errors";
import type { AuthContext } from "@/modules/auth";
import { getCustomerDocumentService } from "../module";
import type { CustomerDocumentsResponse } from "../documents/document.service";

export async function listMyDocumentsHandler(context: AuthContext | null): Promise<Result<CustomerDocumentsResponse, AppError>> {
  if (!context) return err(new UnauthorizedError("Not authenticated"));
  return getCustomerDocumentService().listForCustomer(context.userId);
}
