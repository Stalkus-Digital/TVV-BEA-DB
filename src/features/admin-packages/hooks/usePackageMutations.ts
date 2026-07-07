"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import {
  addPackageAvailability,
  addPackageDay,
  addPackageItem,
  archivePackage,
  createPackage,
  publishPackage,
  removePackageDay,
  removePackageItem,
  rollbackPackageVersion,
  updatePackage,
  updatePackageDay,
  upsertPackagePricing,
  upsertPackageRules,
} from "../api/packages";
import type {
  CreateAvailabilityInput,
  CreateDayInput,
  CreateItemInput,
  CreatePackageInput,
  UpdatePackageInput,
  UpsertPricingInput,
  UpsertRulesInput,
} from "../types";

function invalidatePackageQueries(queryClient: ReturnType<typeof useQueryClient>, packageId?: string) {
  void queryClient.invalidateQueries({ queryKey: ["admin", "packages", "list"] });
  void queryClient.invalidateQueries({ queryKey: ["admin", "packages", "all"] });
  if (packageId) {
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.packages.detail(packageId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.packages.preview(packageId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.packages.pricing(packageId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.packages.compute(packageId, { adults: 2 }) });
    void queryClient.invalidateQueries({ queryKey: ["admin", "packages", "compute", packageId] });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.packages.rules(packageId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.packages.availability(packageId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.packages.days(packageId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.packages.versions(packageId) });
  }
}

export function useCreatePackageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePackageInput) => createPackage(input),
    onSuccess: () => invalidatePackageQueries(queryClient),
  });
}

export function useUpdatePackageMutation(packageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePackageInput) => updatePackage(packageId, input),
    onSuccess: () => invalidatePackageQueries(queryClient, packageId),
  });
}

export function usePublishPackageMutation(packageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changeNote?: string) => publishPackage(packageId, changeNote),
    onSuccess: () => invalidatePackageQueries(queryClient, packageId),
  });
}

export function useArchivePackageMutation(packageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => archivePackage(packageId),
    onSuccess: () => invalidatePackageQueries(queryClient, packageId),
  });
}

export function useUpsertPricingMutation(packageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertPricingInput) => upsertPackagePricing(packageId, input),
    onSuccess: () => invalidatePackageQueries(queryClient, packageId),
  });
}

export function useUpsertRulesMutation(packageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertRulesInput) => upsertPackageRules(packageId, input),
    onSuccess: () => invalidatePackageQueries(queryClient, packageId),
  });
}

export function useAddAvailabilityMutation(packageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAvailabilityInput) => addPackageAvailability(packageId, input),
    onSuccess: () => invalidatePackageQueries(queryClient, packageId),
  });
}

export function useAddDayMutation(packageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDayInput) => addPackageDay(packageId, input),
    onSuccess: () => invalidatePackageQueries(queryClient, packageId),
  });
}

export function useUpdateDayMutation(packageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dayId, input }: { dayId: string; input: { title?: string; description?: string | null } }) =>
      updatePackageDay(packageId, dayId, input),
    onSuccess: () => invalidatePackageQueries(queryClient, packageId),
  });
}

export function useRemoveDayMutation(packageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dayId: string) => removePackageDay(packageId, dayId),
    onSuccess: () => invalidatePackageQueries(queryClient, packageId),
  });
}

export function useAddItemMutation(packageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dayId, input }: { dayId: string; input: CreateItemInput }) => addPackageItem(packageId, dayId, input),
    onSuccess: () => invalidatePackageQueries(queryClient, packageId),
  });
}

export function useRemoveItemMutation(packageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dayId, itemId }: { dayId: string; itemId: string }) => removePackageItem(packageId, dayId, itemId),
    onSuccess: () => invalidatePackageQueries(queryClient, packageId),
  });
}

export function useRollbackVersionMutation(packageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => rollbackPackageVersion(packageId, versionId),
    onSuccess: () => invalidatePackageQueries(queryClient, packageId),
  });
}
