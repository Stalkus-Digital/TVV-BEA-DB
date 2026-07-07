"use client";

import { useQuery } from "@tanstack/react-query";
import { buildCustomerList } from "../utils";
import type { CustomerListFilters } from "../types";
import { useAllUsersQuery } from "./useAllUsersQuery";
import { useCustomerRelationshipDataQuery } from "./useCustomerRelationshipDataQuery";
import { adminQueryKeys } from "@/shared/lib/query-client";

function serializeFilters(filters: CustomerListFilters) {
  return {
    search: filters.search ?? "",
    sortBy: filters.sortBy ?? "lastActivity",
    sortDir: filters.sortDir ?? "desc",
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 20,
  };
}

export function useCustomersQuery(filters: CustomerListFilters) {
  const serialized = serializeFilters(filters);
  const usersQuery = useAllUsersQuery();
  const relationshipQuery = useCustomerRelationshipDataQuery();

  return useQuery({
    queryKey: adminQueryKeys.customers.list(serialized),
    queryFn: () => buildCustomerList(usersQuery.data!, relationshipQuery.data!, filters),
    enabled: Boolean(usersQuery.data && relationshipQuery.data),
    placeholderData: (previous) => previous,
  });
}

export function useCustomersQueryState(filters: CustomerListFilters) {
  const usersQuery = useAllUsersQuery();
  const relationshipQuery = useCustomerRelationshipDataQuery();
  const customersQuery = useCustomersQuery(filters);

  const isLoading =
    usersQuery.isLoading || relationshipQuery.isLoading || (customersQuery.isLoading && !customersQuery.data);
  const isError = usersQuery.isError || relationshipQuery.isError || customersQuery.isError;
  const error = usersQuery.error ?? relationshipQuery.error ?? customersQuery.error ?? undefined;

  const refetch = async () => {
    await Promise.all([usersQuery.refetch(), relationshipQuery.refetch()]);
  };

  return {
    data: customersQuery.data,
    users: usersQuery.data,
    bundle: relationshipQuery.data,
    isLoading,
    isError,
    error,
    isFetching: usersQuery.isFetching || relationshipQuery.isFetching || customersQuery.isFetching,
    refetch,
  };
}
