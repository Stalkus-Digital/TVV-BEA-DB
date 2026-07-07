"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import {
  addDestinationFaq,
  addDestinationGalleryImage,
  archiveDestination,
  createDestination,
  removeDestinationFaq,
  removeDestinationGalleryImage,
  updateDestination,
} from "../api/destinations";
import type { CreateDestinationInput, CreateFaqInput, CreateGalleryImageInput, UpdateDestinationInput } from "../types";

function invalidateDestinationQueries(queryClient: ReturnType<typeof useQueryClient>, destinationId?: string) {
  void queryClient.invalidateQueries({ queryKey: ["admin", "destinations"] });
  if (destinationId) {
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.destinations.detail(destinationId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.destinations.breadcrumbs(destinationId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.destinations.children(destinationId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.destinations.nearby(destinationId) });
  }
}

export function useCreateDestinationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDestinationInput) => createDestination(input),
    onSuccess: () => invalidateDestinationQueries(queryClient),
  });
}

export function useUpdateDestinationMutation(destinationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateDestinationInput) => updateDestination(destinationId, input),
    onSuccess: () => invalidateDestinationQueries(queryClient, destinationId),
  });
}

export function useArchiveDestinationMutation(destinationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => archiveDestination(destinationId),
    onSuccess: () => invalidateDestinationQueries(queryClient, destinationId),
  });
}

export function useAddFaqMutation(destinationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFaqInput) => addDestinationFaq(destinationId, input),
    onSuccess: () => invalidateDestinationQueries(queryClient, destinationId),
  });
}

export function useRemoveFaqMutation(destinationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (faqId: string) => removeDestinationFaq(destinationId, faqId),
    onSuccess: () => invalidateDestinationQueries(queryClient, destinationId),
  });
}

export function useAddGalleryImageMutation(destinationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGalleryImageInput) => addDestinationGalleryImage(destinationId, input),
    onSuccess: () => invalidateDestinationQueries(queryClient, destinationId),
  });
}

export function useRemoveGalleryImageMutation(destinationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => removeDestinationGalleryImage(destinationId, imageId),
    onSuccess: () => invalidateDestinationQueries(queryClient, destinationId),
  });
}
