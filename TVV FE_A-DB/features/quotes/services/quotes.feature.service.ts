import {
  fetchMyQuotes,
  fetchQuoteById,
  submitQuoteRequest,
  type QuoteRequestInput,
} from "@/lib/api/quotes";
import { ok, fail, type ServiceResult } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

export const quotesFeatureService = {
  async submit(input: QuoteRequestInput): Promise<ServiceResult<{ id: string }>> {
    try {
      const data = await submitQuoteRequest(input);
      return ok({ id: data.id }, "live");
    } catch (err) {
      return fail<{ id: string }>(ApiError.fromUnknown(err), "live");
    }
  },

  api: {
    fetchList: fetchMyQuotes,
    fetchDetail: fetchQuoteById,
    submit: submitQuoteRequest,
  },
};
