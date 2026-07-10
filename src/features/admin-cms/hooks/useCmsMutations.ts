"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import {
  addDestinationFaq,
  addPackageFaq,
  removeDestinationFaq,
  removePackageFaq,
  updateDestinationFaq,
  updatePackageFaq,
  updateDestinationFeatured,
  updateDestinationSeo,
  updatePackageSeo,
  updateCmsConfig,
} from "../api/cms";
import { deleteStorageObject, uploadStorageObject } from "../api/storage";
import type { CreateFaqInput, DeleteStorageInput, UpdateSeoInput, UploadStorageInput } from "../types";
import { useInvalidateCmsQueries } from "./useCmsQueries";

export function useUpdateFeaturedMutation() {
  const invalidate = useInvalidateCmsQueries();
  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      updateDestinationFeatured(id, isFeatured),
    onSuccess: invalidate,
  });
}

export function useUpdateSeoMutation() {
  const invalidate = useInvalidateCmsQueries();
  return useMutation({
    mutationFn: async ({
      type,
      id,
      seo,
    }: {
      type: "destination" | "package";
      id: string;
      seo: UpdateSeoInput;
    }) => {
      if (type === "destination") return updateDestinationSeo(id, seo);
      return updatePackageSeo(id, seo);
    },
    onSuccess: invalidate,
  });
}

export function useAddFaqMutation() {
  const invalidate = useInvalidateCmsQueries();
  return useMutation({
    mutationFn: async ({
      parentType,
      parentId,
      input,
    }: {
      parentType: "destination" | "package";
      parentId: string;
      input: CreateFaqInput;
    }) => {
      if (parentType === "destination") return addDestinationFaq(parentId, input);
      return addPackageFaq(parentId, input);
    },
    onSuccess: invalidate,
  });
}

export function useRemoveFaqMutation() {
  const invalidate = useInvalidateCmsQueries();
  return useMutation({
    mutationFn: async ({
      parentType,
      parentId,
      faqId,
    }: {
      parentType: "destination" | "package";
      parentId: string;
      faqId: string;
    }) => {
      if (parentType === "destination") return removeDestinationFaq(parentId, faqId);
      return removePackageFaq(parentId, faqId);
    },
    onSuccess: invalidate,
  });
}

export function useUpdateFaqMutation() {
  const invalidate = useInvalidateCmsQueries();
  return useMutation({
    mutationFn: async ({
      parentType,
      parentId,
      faqId,
      input,
    }: {
      parentType: "destination" | "package";
      parentId: string;
      faqId: string;
      input: { question: string; answer: string };
    }) => {
      if (parentType === "destination") return updateDestinationFaq(parentId, faqId, input);
      return updatePackageFaq(parentId, faqId, input);
    },
    onSuccess: invalidate,
  });
}

export function useUploadMediaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadStorageInput) => uploadStorageObject(input),
    onSuccess: (object) => {
      queryClient.setQueryData<typeof object[]>(adminQueryKeys.cms.uploads, (current) => [
        object,
        ...(current ?? []),
      ]);
    },
  });
}

export function useDeleteMediaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteStorageInput) => deleteStorageObject(input),
    onSuccess: (_result, variables) => {
      queryClient.setQueryData<import("../types").StorageObject[]>(
        adminQueryKeys.cms.uploads,
        (current) => current?.filter((item) => item.key !== variables.key) ?? []
      );
    },
  });
}

export function useUpdateCmsConfigMutation() {
  const invalidate = useInvalidateCmsQueries();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) => updateCmsConfig(key, value),
    onSuccess: invalidate,
  });
}
