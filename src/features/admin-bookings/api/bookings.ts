import { adminApiClient } from "@/lib/admin-api/client";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import type { PaginatedResult } from "@/lib/admin-api/types";
import type {
  AddDocumentInput,
  AddTravellerInput,
  Booking,
  BookingInvoice,
  BookingListFilters,
  BookingNote,
  BookingPayment,
  BookingStatusHistory,
  BookingTimelineEntry,
  BookingVoucher,
  CreateBookingInput,
  PassengerDocument,
  RecordPaymentInput,
  Traveller,
} from "../types";

function bookingPath(id: string) {
  return `${adminEndpoints.bookings}/${id}`;
}

export async function fetchBookings(filters: BookingListFilters = {}): Promise<PaginatedResult<Booking>> {
  const result = await adminApiClient.get<PaginatedResult<Booking>>(adminEndpoints.bookings, {
    params: {
      status: filters.status,
      hasItemKind: filters.hasItemKind,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
    },
  });
  if (!result) {
    return { items: [], page: 1, pageSize: filters.pageSize ?? 20, total: 0, totalPages: 1 };
  }
  return result;
}

export async function fetchAllBookings(filters: Pick<BookingListFilters, "status" | "hasItemKind"> = {}): Promise<Booking[]> {
  const pageSize = 20;
  let page = 1;
  let totalPages = 1;
  const items: Booking[] = [];

  while (page <= totalPages) {
    const result = await fetchBookings({ ...filters, page, pageSize });
    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  return items;
}

export async function fetchBooking(id: string): Promise<Booking> {
  const result = await adminApiClient.get<Booking>(bookingPath(id));
  if (!result) throw new Error("Booking not found");
  return result;
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const result = await adminApiClient.post<Booking>(adminEndpoints.bookings, input);
  if (!result) throw new Error("Failed to create booking");
  return result;
}

export async function updateBooking(id: string, input: { internalNotes?: string | null }): Promise<Booking> {
  const result = await adminApiClient.patch<Booking>(bookingPath(id), input);
  if (!result) throw new Error("Failed to update booking");
  return result;
}

export async function confirmBooking(id: string): Promise<Booking> {
  const result = await adminApiClient.post<Booking>(`${bookingPath(id)}/confirm`, {});
  if (!result) throw new Error("Failed to confirm booking");
  return result;
}

export async function cancelBooking(id: string, reason: string): Promise<Booking> {
  const result = await adminApiClient.post<Booking>(`${bookingPath(id)}/cancel`, { reason });
  if (!result) throw new Error("Failed to cancel booking");
  return result;
}

export async function ticketBooking(id: string): Promise<Booking> {
  const result = await adminApiClient.post<Booking>(`${bookingPath(id)}/ticket`, {});
  if (!result) throw new Error("Failed to ticket booking");
  return result;
}

export async function completeBooking(id: string): Promise<Booking> {
  const result = await adminApiClient.post<Booking>(`${bookingPath(id)}/complete`, {});
  if (!result) throw new Error("Failed to complete booking");
  return result;
}

export async function fetchTravellers(bookingId: string): Promise<Traveller[]> {
  const result = await adminApiClient.get<Traveller[]>(`${bookingPath(bookingId)}/travellers`);
  return result ?? [];
}

export async function addTraveller(bookingId: string, input: AddTravellerInput): Promise<Traveller> {
  const result = await adminApiClient.post<Traveller>(`${bookingPath(bookingId)}/travellers`, input);
  if (!result) throw new Error("Failed to add traveller");
  return result;
}

export async function removeTraveller(bookingId: string, travellerId: string): Promise<void> {
  await adminApiClient.delete(`${bookingPath(bookingId)}/travellers/${travellerId}`);
}

export async function fetchPayments(bookingId: string): Promise<BookingPayment[]> {
  const result = await adminApiClient.get<BookingPayment[]>(`${bookingPath(bookingId)}/payments`);
  return result ?? [];
}

export async function recordPayment(bookingId: string, input: RecordPaymentInput): Promise<BookingPayment> {
  const result = await adminApiClient.post<BookingPayment>(`${bookingPath(bookingId)}/payments`, input);
  if (!result) throw new Error("Failed to record payment");
  return result;
}

export async function fetchDocuments(bookingId: string): Promise<PassengerDocument[]> {
  const result = await adminApiClient.get<PassengerDocument[]>(`${bookingPath(bookingId)}/documents`);
  return result ?? [];
}

export async function addDocument(bookingId: string, input: AddDocumentInput): Promise<PassengerDocument> {
  const result = await adminApiClient.post<PassengerDocument>(`${bookingPath(bookingId)}/documents`, input);
  if (!result) throw new Error("Failed to add document");
  return result;
}

export async function fetchNotes(bookingId: string): Promise<BookingNote[]> {
  const result = await adminApiClient.get<BookingNote[]>(`${bookingPath(bookingId)}/notes`);
  return result ?? [];
}

export async function addNote(bookingId: string, body: string): Promise<BookingNote> {
  const result = await adminApiClient.post<BookingNote>(`${bookingPath(bookingId)}/notes`, { body });
  if (!result) throw new Error("Failed to add note");
  return result;
}

export async function fetchTimeline(bookingId: string): Promise<BookingTimelineEntry[]> {
  const result = await adminApiClient.get<BookingTimelineEntry[]>(`${bookingPath(bookingId)}/timeline`);
  return result ?? [];
}

export async function fetchStatusHistory(bookingId: string): Promise<BookingStatusHistory[]> {
  const result = await adminApiClient.get<BookingStatusHistory[]>(`${bookingPath(bookingId)}/status-history`);
  return result ?? [];
}

export async function generateVoucher(bookingId: string): Promise<BookingVoucher> {
  const result = await adminApiClient.post<BookingVoucher>(`${bookingPath(bookingId)}/voucher`, {});
  if (!result) throw new Error("Failed to generate voucher");
  return result;
}

export async function generateInvoice(bookingId: string): Promise<BookingInvoice> {
  const result = await adminApiClient.post<BookingInvoice>(`${bookingPath(bookingId)}/invoice`, {});
  if (!result) throw new Error("Failed to generate invoice");
  return result;
}
