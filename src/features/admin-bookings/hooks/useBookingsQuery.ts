"use client";

import { useQuery } from "@tanstack/react-query";
import { useAllUsersQuery } from "@/features/admin-customers/hooks/useAllUsersQuery";
import { useCustomerRelationshipDataQuery } from "@/features/admin-customers/hooks/useCustomerRelationshipDataQuery";
import { fetchAllBookings, fetchBookings } from "../api/bookings";
import type { BookingListFilters } from "../types";
import {
  applyBookingDateFilter,
  applyBookingSearch,
  applyPaymentStatusFilter,
  enrichBookingRows,
  needsClientBookingFiltering,
  paginateBookings,
  sortBookings,
} from "../utils";
import { adminQueryKeys } from "@/shared/lib/query-client";

function serializeFilters(filters: BookingListFilters) {
  return {
    status: filters.status ?? "",
    paymentStatus: filters.paymentStatus ?? "",
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
  const clientMode = needsClientBookingFiltering(filters);
  const usersQuery = useAllUsersQuery();

  return useQuery({
    queryKey: clientMode ? adminQueryKeys.bookings.all(serialized) : adminQueryKeys.bookings.list(serialized),
    queryFn: async () => {
      const users = usersQuery.data ?? [];
      const usersById = new Map(users.map((user) => [user.id, user]));

      if (clientMode) {
        const all = await fetchAllBookings({ status: filters.status });
        let filtered = applyBookingSearch(all, filters.search);
        filtered = applyPaymentStatusFilter(filtered, filters.paymentStatus);
        filtered = applyBookingDateFilter(filtered, filters.dateFrom, filters.dateTo);
        const rows = enrichBookingRows(filtered, usersById);
        const sorted = sortBookings(rows, filters.sortBy ?? "createdAt", filters.sortDir ?? "desc");
        return paginateBookings(sorted, filters.page ?? 1, filters.pageSize ?? 20);
      }

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
