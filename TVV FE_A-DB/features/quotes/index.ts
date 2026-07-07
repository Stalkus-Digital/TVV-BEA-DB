export { QuoteCard } from "./components/QuoteCard";
export { QuotesListView } from "./components/QuotesListView";

export { quotesFeatureService } from "./services/quotes.feature.service";
export { useQuotesQuery } from "./hooks/useQuotesQuery";
export { useQuoteDetail } from "./hooks/useQuoteDetail";
export { useSubmitQuoteMutation } from "./hooks/useSubmitQuoteMutation";

export { quoteRequestSchema, type QuoteRequestFormValues } from "./schemas";

export type { QuoteRequestInput, QuoteSummary, QuoteListItem } from "./types";
