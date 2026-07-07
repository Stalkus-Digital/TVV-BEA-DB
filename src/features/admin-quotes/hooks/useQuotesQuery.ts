"use client";

import { useQuery } from "@tanstack/react-query";
import { useAllUsersQuery } from "@/features/admin-customers/hooks/useAllUsersQuery";
import { useCustomerRelationshipDataQuery } from "@/features/admin-customers/hooks/useCustomerRelationshipDataQuery";
import {
  fetchAllQuotes,
  fetchPricingForQuotes,
  fetchQuotes,
} from "../api/quotes";
import type { PublicUser } from "@/features/admin-customers/types";
import type { Quote, QuoteListFilters, QuoteListRow } from "../types";
import {
  applyQuoteCustomerFilter,
  applyQuoteDateFilter,
  applyQuoteSearch,
  needsClientQuoteFiltering,
  paginateQuotes,
  resolveCustomerLabel,
  sortQuotes,
} from "../utils";
import { adminQueryKeys } from "@/shared/lib/query-client";

function serializeFilters(filters: QuoteListFilters) {
  return {
    status: filters.status ?? "",
    customerId: filters.customerId ?? "",
    search: filters.search ?? "",
    dateFrom: filters.dateFrom ?? "",
    dateTo: filters.dateTo ?? "",
    sortBy: filters.sortBy ?? "createdAt",
    sortDir: filters.sortDir ?? "desc",
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 20,
  };
}

async function enrichQuoteRows(quotes: Quote[], usersById: Map<string, PublicUser>): Promise<QuoteListRow[]> {
  const pricingById = await fetchPricingForQuotes(quotes);
  return quotes.map((quote) => ({
    ...quote,
    totalAmount: pricingById.get(quote.id) ?? null,
    customerLabel: resolveCustomerLabel(quote, usersById),
  }));
}

export function useQuotesQuery(filters: QuoteListFilters) {
  const serialized = serializeFilters(filters);
  const clientMode = needsClientQuoteFiltering(filters);
  const usersQuery = useAllUsersQuery();

  return useQuery({
    queryKey: clientMode ? adminQueryKeys.quotes.all(serialized) : adminQueryKeys.quotes.list(serialized),
    queryFn: async () => {
      const users = usersQuery.data ?? [];
      const usersById = new Map(users.map((user) => [user.id, user]));

      if (clientMode) {
        const all = await fetchAllQuotes({ status: filters.status });
        let filtered = applyQuoteSearch(all, filters.search);
        filtered = applyQuoteCustomerFilter(filtered, filters.customerId, users);
        filtered = applyQuoteDateFilter(filtered, filters.dateFrom, filters.dateTo);
        const rows = await enrichQuoteRows(filtered, usersById);
        const sorted = sortQuotes(rows, filters.sortBy ?? "createdAt", filters.sortDir ?? "desc");
        return paginateQuotes(sorted, filters.page ?? 1, filters.pageSize ?? 20);
      }

      const page = await fetchQuotes(filters);
      const rows = await enrichQuoteRows(page.items, usersById);
      return { ...page, items: rows };
    },
    enabled: usersQuery.isSuccess,
    placeholderData: (previous) => previous,
  });
}

export function useQuotesQueryState(filters: QuoteListFilters) {
  const quotesQuery = useQuotesQuery(filters);
  const usersQuery = useAllUsersQuery();
  const relationshipQuery = useCustomerRelationshipDataQuery();

  const refetch = async () => {
    await Promise.all([usersQuery.refetch(), relationshipQuery.refetch(), quotesQuery.refetch()]);
  };

  return {
    data: quotesQuery.data,
    users: usersQuery.data,
    bundle: relationshipQuery.data,
    isLoading: quotesQuery.isLoading || usersQuery.isLoading,
    isError: quotesQuery.isError || usersQuery.isError,
    error: quotesQuery.error ?? usersQuery.error,
    isFetching: quotesQuery.isFetching || usersQuery.isFetching || relationshipQuery.isFetching,
    refetch,
  };
}

export function useQuoteLookups() {
  const usersQuery = useAllUsersQuery();
  const relationshipQuery = useCustomerRelationshipDataQuery();
  return { users: usersQuery.data ?? [], bundle: relationshipQuery.data, usersQuery, relationshipQuery };
}
