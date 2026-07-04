import { ok, fail, type ServiceResult } from "@/lib/api";
import { quotesFeatureService } from "@/features/quotes";
import type { QuoteRequestInput } from "@/lib/api/quotes";

export type EnquiryInput = QuoteRequestInput;

/** @deprecated Prefer `quotesFeatureService` from `@/features/quotes`. */
export const enquiriesService = {
  submit(input: EnquiryInput): Promise<ServiceResult<{ id: string }>> {
    return quotesFeatureService.submit(input);
  },
};

export type EnquiriesService = typeof enquiriesService;
