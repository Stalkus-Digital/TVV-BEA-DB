"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchDocuments,
  fetchNotes,
  fetchPayments,
  fetchStatusHistory,
  fetchTimeline,
  fetchTravellers,
} from "../api/bookings";
import { adminQueryKeys } from "@/shared/lib/query-client";

export function useBookingTravellersQuery(bookingId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.bookings.travellers(bookingId ?? ""),
    queryFn: () => fetchTravellers(bookingId!),
    enabled: Boolean(bookingId),
  });
}

export function useBookingPaymentsQuery(bookingId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.bookings.payments(bookingId ?? ""),
    queryFn: () => fetchPayments(bookingId!),
    enabled: Boolean(bookingId),
  });
}

export function useBookingDocumentsQuery(bookingId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.bookings.documents(bookingId ?? ""),
    queryFn: () => fetchDocuments(bookingId!),
    enabled: Boolean(bookingId),
  });
}

export function useBookingNotesQuery(bookingId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.bookings.notes(bookingId ?? ""),
    queryFn: () => fetchNotes(bookingId!),
    enabled: Boolean(bookingId),
  });
}

export function useBookingTimelineQuery(bookingId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.bookings.timeline(bookingId ?? ""),
    queryFn: () => fetchTimeline(bookingId!),
    enabled: Boolean(bookingId),
  });
}

export function useBookingStatusHistoryQuery(bookingId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.bookings.statusHistory(bookingId ?? ""),
    queryFn: () => fetchStatusHistory(bookingId!),
    enabled: Boolean(bookingId),
  });
}
