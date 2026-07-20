"use client";

import { useQuery } from "@tanstack/react-query";
import { useAllUsersQuery } from "@/features/admin-customers/hooks/useAllUsersQuery";
import { useCustomerRelationshipDataQuery } from "@/features/admin-customers/hooks/useCustomerRelationshipDataQuery";
import { fetchBookings } from "../api/bookings";
import type { BookingListFilters } from "../types";
import { enrichBookingRows } from "../utils";
import { adminQueryKeys } from "@/shared/lib/query-client";

function serializeFilters(filters: BookingListFilters) {
  return {
    status: filters.status ?? "",
    paymentStatus: filters.paymentStatus ?? "",
    hasItemKind: filters.hasItemKind ?? "",
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

export function useBookingsQuery(filters: BookingListFilters) {
  const serialized = serializeFilters(filters);
  const usersQuery = useAllUsersQuery();

  return useQuery({
    queryKey: adminQueryKeys.bookings.list(serialized),
    queryFn: async () => {
      const users = usersQuery.data ?? [];
      const usersById = new Map(users.map((user) => [user.id, user]));
      const page = await fetchBookings(filters);
      const rows = enrichBookingRows(page.items, usersById);
      return { ...page, items: rows };
    },
    enabled: usersQuery.isSuccess,
    placeholderData: (previous) => previous,
  });
}

export function useBookingsQueryState(filters: BookingListFilters) {
  const bookingsQuery = useBookingsQuery(filters);
  const usersQuery = useAllUsersQuery();
  const relationshipQuery = useCustomerRelationshipDataQuery();

  const refetch = async () => {
    await Promise.all([usersQuery.refetch(), relationshipQuery.refetch(), bookingsQuery.refetch()]);
  };

  return {
    data: bookingsQuery.data,
    users: usersQuery.data,
    bundle: relationshipQuery.data,
    isLoading: bookingsQuery.isLoading || usersQuery.isLoading,
    isError: bookingsQuery.isError || usersQuery.isError,
    error: bookingsQuery.error ?? usersQuery.error,
    isFetching: bookingsQuery.isFetching || usersQuery.isFetching || relationshipQuery.isFetching,
    refetch,
  };
}
