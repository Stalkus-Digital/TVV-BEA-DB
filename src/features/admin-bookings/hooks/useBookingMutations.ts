"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addDocument,
  addNote,
  addTraveller,
  cancelBooking,
  completeBooking,
  confirmBooking,
  createBooking,
  deleteBooking,
  generateInvoice,
  generateVoucher,
  recordPayment,
  removeTraveller,
  ticketBooking,
  updateBooking,
} from "../api/bookings";
import type { AddDocumentInput, AddTravellerInput, CreateBookingInput, RecordPaymentInput } from "../types";
import { adminQueryKeys } from "@/shared/lib/query-client";

function invalidateBookingQueries(queryClient: ReturnType<typeof useQueryClient>, bookingId?: string) {
  void queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
  void queryClient.invalidateQueries({ queryKey: adminQueryKeys.customers.relationshipData });
  void queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard.activity });
  void queryClient.invalidateQueries({ queryKey: adminQueryKeys.quotes.all({}) });
  if (bookingId) {
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookings.detail(bookingId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookings.travellers(bookingId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookings.payments(bookingId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookings.documents(bookingId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookings.notes(bookingId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookings.timeline(bookingId) });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookings.statusHistory(bookingId) });
  }
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => createBooking(input),
    onSuccess: () => invalidateBookingQueries(queryClient),
  });
}

export function useDeleteBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => deleteBooking(bookingId),
    onSuccess: () => invalidateBookingQueries(queryClient),
  });
}

export function useUpdateBookingMutation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { internalNotes?: string | null }) => updateBooking(bookingId, input),
    onSuccess: () => invalidateBookingQueries(queryClient, bookingId),
  });
}

export function useConfirmBookingMutation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => confirmBooking(bookingId),
    onSuccess: () => invalidateBookingQueries(queryClient, bookingId),
  });
}

export function useCancelBookingMutation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => cancelBooking(bookingId, reason),
    onSuccess: () => invalidateBookingQueries(queryClient, bookingId),
  });
}

export function useTicketBookingMutation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ticketBooking(bookingId),
    onSuccess: () => invalidateBookingQueries(queryClient, bookingId),
  });
}

export function useCompleteBookingMutation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => completeBooking(bookingId),
    onSuccess: () => invalidateBookingQueries(queryClient, bookingId),
  });
}

export function useRecordPaymentMutation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordPaymentInput) => recordPayment(bookingId, input),
    onSuccess: () => invalidateBookingQueries(queryClient, bookingId),
  });
}

export function useAddTravellerMutation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddTravellerInput) => addTraveller(bookingId, input),
    onSuccess: () => invalidateBookingQueries(queryClient, bookingId),
  });
}

export function useRemoveTravellerMutation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (travellerId: string) => removeTraveller(bookingId, travellerId),
    onSuccess: () => invalidateBookingQueries(queryClient, bookingId),
  });
}

export function useAddDocumentMutation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddDocumentInput) => addDocument(bookingId, input),
    onSuccess: () => invalidateBookingQueries(queryClient, bookingId),
  });
}

export function useAddNoteMutation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => addNote(bookingId, body),
    onSuccess: () => invalidateBookingQueries(queryClient, bookingId),
  });
}

export function useGenerateVoucherMutation(bookingId: string) {
  return useMutation({
    mutationFn: () => generateVoucher(bookingId),
  });
}

export function useGenerateInvoiceMutation(bookingId: string) {
  return useMutation({
    mutationFn: () => generateInvoice(bookingId),
  });
}
