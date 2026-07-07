"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import { fetchSupplierHealth, fetchSuppliers } from "../api/inventory";

export function useSuppliersQuery() {
  return useQuery({
    queryKey: adminQueryKeys.inventory.suppliers,
    queryFn: fetchSuppliers,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSuppliersWithHealthQuery() {
  const suppliersQuery = useSuppliersQuery();

  const healthQueries = useQueries({
    queries: (suppliersQuery.data ?? []).map((supplier) => ({
      queryKey: adminQueryKeys.inventory.supplierHealth(supplier.code),
      queryFn: () => fetchSupplierHealth(supplier.code),
      enabled: suppliersQuery.isSuccess,
      staleTime: 60 * 1000,
    })),
  });

  const suppliers = suppliersQuery.data ?? [];
  const healthByCode = new Map(
    suppliers.map((supplier, index) => [supplier.code, healthQueries[index]?.data])
  );

  return {
    suppliers,
    healthByCode,
    isLoading: suppliersQuery.isLoading || healthQueries.some((q) => q.isLoading),
    isError: suppliersQuery.isError,
    refetch: () => void suppliersQuery.refetch(),
  };
}
