"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignEnquiry,
  createEnquiry,
  createEnquiryNote,
  deleteEnquiry,
  deleteEnquiryNote,
  updateEnquiryNote,
  updateEnquiryStatus,
  updateEnquiryFollowUp,
} from "../api/enquiries";
import type { EnquiryStatus } from "../types";
import { adminQueryKeys } from "@/shared/lib/query-client";

function invalidateEnquiryQueries(queryClient: ReturnType<typeof useQueryClient>, enquiryId: string) {
  void queryClient.invalidateQueries({ queryKey: ["admin", "enquiries"] });
  void queryClient.invalidateQueries({ queryKey: adminQueryKeys.enquiries.detail(enquiryId) });
  void queryClient.invalidateQueries({ queryKey: adminQueryKeys.enquiries.notes(enquiryId) });
  void queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard.activity });
}

export function useUpdateEnquiryStatusMutation(enquiryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: EnquiryStatus) => updateEnquiryStatus(enquiryId, status),
    onSuccess: () => invalidateEnquiryQueries(queryClient, enquiryId),
  });
}

export function useAssignEnquiryMutation(enquiryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignedToUserId: string | null) => assignEnquiry(enquiryId, assignedToUserId),
    onSuccess: () => invalidateEnquiryQueries(queryClient, enquiryId),
  });
}

export function useCreateEnquiryNoteMutation(enquiryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => createEnquiryNote(enquiryId, body),
    onSuccess: () => invalidateEnquiryQueries(queryClient, enquiryId),
  });
}

export function useUpdateEnquiryNoteMutation(enquiryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, body }: { noteId: string; body: string }) => updateEnquiryNote(enquiryId, noteId, body),
    onSuccess: () => invalidateEnquiryQueries(queryClient, enquiryId),
  });
}

export function useDeleteEnquiryNoteMutation(enquiryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => deleteEnquiryNote(enquiryId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.enquiries.notes(enquiryId) });
    },
  });
}

export function useCreateEnquiryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; phone?: string; source?: string; sourceUrl?: string }) =>
      createEnquiry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "enquiries"] });
    },
  });
}

export function useUpdateEnquiryFollowUpMutation(enquiryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { followUpDate: string | null; priority?: string | null }) =>
      updateEnquiryFollowUp(enquiryId, data),
    onSuccess: () => invalidateEnquiryQueries(queryClient, enquiryId),
  });
}

export function useDeleteEnquiryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEnquiry(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "enquiries"] });
      void queryClient.removeQueries({ queryKey: adminQueryKeys.enquiries.detail(id) });
      void queryClient.removeQueries({ queryKey: adminQueryKeys.enquiries.notes(id) });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard.activity });
    },
  });
}
