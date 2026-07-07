"use client";

import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import {
  fetchSystemHealth,
  fetchSystemLogs,
  fetchSystemMetrics,
  fetchSystemModules,
  fetchSystemPerformance,
  fetchSystemVersion,
  fetchSupplierRuntimeCircuitBreakers,
  fetchSupplierRuntimeEvents,
  fetchSupplierRuntimeHealth,
  fetchSupplierRuntimeMetrics,
} from "../api/system";
import type { LogsQuery } from "../types";

export function useSystemHealthQuery() {
  return useQuery({
    queryKey: adminQueryKeys.operations.health,
    queryFn: fetchSystemHealth,
    refetchInterval: 60_000,
  });
}

export function useSystemModulesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.operations.modules,
    queryFn: fetchSystemModules,
    refetchInterval: 60_000,
  });
}

export function useSystemMetricsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.operations.metrics,
    queryFn: fetchSystemMetrics,
    refetchInterval: 30_000,
  });
}

export function useSystemPerformanceQuery() {
  return useQuery({
    queryKey: adminQueryKeys.operations.performance,
    queryFn: fetchSystemPerformance,
    refetchInterval: 30_000,
  });
}

export function useSystemVersionQuery() {
  return useQuery({
    queryKey: adminQueryKeys.operations.version,
    queryFn: fetchSystemVersion,
    staleTime: 5 * 60_000,
  });
}

export function useSystemLogsQuery(query: LogsQuery) {
  const filter = { level: query.level ?? "", scope: query.scope ?? "", limit: query.limit ?? 100 };
  return useQuery({
    queryKey: adminQueryKeys.operations.logs(filter),
    queryFn: () => fetchSystemLogs(query),
    refetchInterval: 15_000,
  });
}

export function useSupplierRuntimeHealthQuery() {
  return useQuery({
    queryKey: adminQueryKeys.operations.supplierRuntime.health,
    queryFn: fetchSupplierRuntimeHealth,
    refetchInterval: 30_000,
  });
}

export function useSupplierRuntimeMetricsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.operations.supplierRuntime.metrics,
    queryFn: fetchSupplierRuntimeMetrics,
    refetchInterval: 30_000,
  });
}

export function useSupplierRuntimeEventsQuery(limit = 50) {
  return useQuery({
    queryKey: adminQueryKeys.operations.supplierRuntime.events(limit),
    queryFn: () => fetchSupplierRuntimeEvents(limit),
    refetchInterval: 15_000,
  });
}

export function useSupplierRuntimeCircuitBreakersQuery() {
  return useQuery({
    queryKey: adminQueryKeys.operations.supplierRuntime.circuitBreakers,
    queryFn: fetchSupplierRuntimeCircuitBreakers,
    refetchInterval: 30_000,
  });
}

export function useObservabilityBundleQuery() {
  const metricsQuery = useSystemMetricsQuery();
  const performanceQuery = useSystemPerformanceQuery();
  const versionQuery = useSystemVersionQuery();
  const modulesQuery = useSystemModulesQuery();

  return {
    metrics: metricsQuery.data,
    performance: performanceQuery.data,
    version: versionQuery.data,
    modules: modulesQuery.data ?? [],
    isLoading:
      metricsQuery.isLoading ||
      performanceQuery.isLoading ||
      versionQuery.isLoading ||
      modulesQuery.isLoading,
    isError:
      metricsQuery.isError ||
      performanceQuery.isError ||
      versionQuery.isError ||
      modulesQuery.isError,
    error:
      metricsQuery.error ??
      performanceQuery.error ??
      versionQuery.error ??
      modulesQuery.error,
    isFetching:
      metricsQuery.isFetching ||
      performanceQuery.isFetching ||
      versionQuery.isFetching ||
      modulesQuery.isFetching,
    refetch: async () => {
      await Promise.all([
        metricsQuery.refetch(),
        performanceQuery.refetch(),
        versionQuery.refetch(),
        modulesQuery.refetch(),
      ]);
    },
  };
}

export function useSupplierRuntimeBundleQuery() {
  const healthQuery = useSupplierRuntimeHealthQuery();
  const metricsQuery = useSupplierRuntimeMetricsQuery();
  const eventsQuery = useSupplierRuntimeEventsQuery();
  const breakersQuery = useSupplierRuntimeCircuitBreakersQuery();

  return {
    health: healthQuery.data,
    metrics: metricsQuery.data,
    events: eventsQuery.data ?? [],
    circuitBreakers: breakersQuery.data ?? [],
    isLoading:
      healthQuery.isLoading ||
      metricsQuery.isLoading ||
      eventsQuery.isLoading ||
      breakersQuery.isLoading,
    isError:
      healthQuery.isError ||
      metricsQuery.isError ||
      eventsQuery.isError ||
      breakersQuery.isError,
    error:
      healthQuery.error ??
      metricsQuery.error ??
      eventsQuery.error ??
      breakersQuery.error,
    isFetching:
      healthQuery.isFetching ||
      metricsQuery.isFetching ||
      eventsQuery.isFetching ||
      breakersQuery.isFetching,
    refetch: async () => {
      await Promise.all([
        healthQuery.refetch(),
        metricsQuery.refetch(),
        eventsQuery.refetch(),
        breakersQuery.refetch(),
      ]);
    },
  };
}
