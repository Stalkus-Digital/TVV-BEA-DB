"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import { fetchSignedUrl, uploadStorageObject } from "../api/storage";
import type { StorageCategory, UploadStorageInput } from "../types";

export function useUploadStorageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadStorageInput) => uploadStorageObject(input),
    onSuccess: (object) => {
      queryClient.setQueryData<typeof object[]>(adminQueryKeys.operations.storageUploads, (current) => [
        object,
        ...(current ?? []),
      ]);
    },
  });
}

export function useSignedUrlMutation() {
  return useMutation({
    mutationFn: ({
      category,
      key,
      ownerId,
      ttlSeconds,
    }: {
      category: StorageCategory;
      key: string;
      ownerId: string;
      ttlSeconds?: number;
    }) => fetchSignedUrl(category, key, ownerId, ttlSeconds),
  });
}
