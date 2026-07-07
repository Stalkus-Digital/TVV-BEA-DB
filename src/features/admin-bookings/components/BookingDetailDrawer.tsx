"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDown, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { CustomerRelationshipBundle } from "@/features/admin-customers/types";
import type { PublicUser } from "@/features/admin-customers/types";
import { BookingStatus, PaymentStatus } from "../constants";
import {
  useAddDocumentMutation,
  useAddNoteMutation,
  useAddTravellerMutation,
  useCancelBookingMutation,
  useCompleteBookingMutation,
  useConfirmBookingMutation,
  useGenerateInvoiceMutation,
  useGenerateVoucherMutation,
  useRecordPaymentMutation,
  useRemoveTravellerMutation,
  useTicketBookingMutation,
  useUpdateBookingMutation,
} from "../hooks/useBookingMutations";
import {
  useBookingDocumentsQuery,
  useBookingNotesQuery,
  useBookingPaymentsQuery,
  useBookingStatusHistoryQuery,
  useBookingTimelineQuery,
  useBookingTravellersQuery,
} from "../hooks/useBookingSubQueries";
import { useBookingQuery } from "../hooks/useBookingQuery";
import type { Booking, BookingInvoice, BookingVoucher } from "../types";
import {
  formatBookingDate,
  formatBookingMoney,
  getRelatedRecordsForBooking,
  mergeBookingTimeline,
  resolveCustomerLabel,
} from "../utils";
import { BookingStatusBadge, PaymentStatusBadge } from "./BookingStatusBadge";
import { DocumentKind, TravellerType } from "../constants";
import { WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

interface BookingDetailDrawerProps {
  bookingId: string | null;
  users: PublicUser[];
  bundle?: CustomerRelationshipBundle;
  onClose: () => void;
}

export function BookingDetailDrawer({ bookingId, users, bundle, onClose }: BookingDetailDrawerProps) {
  const bookingQuery = useBookingQuery(bookingId);
  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  if (!bookingId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close booking detail" />
      <div className="relative w-full max-w-2xl h-full bg-card border-l border-border shadow-xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Booking Detail</h2>
            <p className="text-xs text-muted-foreground font-mono">{bookingId}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {bookingQuery.isLoading ? (
            <WidgetLoading label="Loading booking…" />
          ) : bookingQuery.isError || !bookingQuery.data ? (
            <WidgetError message="Failed to load booking" onRetry={() => void bookingQuery.refetch()} />
          ) : (
            <BookingDetailContent booking={bookingQuery.data} users={users} usersById={usersById} bundle={bundle} />
          )}
        </div>
      </div>
    </div>
  );
}

function BookingDetailContent({
  booking,
  users,
  usersById,
  bundle,
}: {
  booking: Booking;
  users: PublicUser[];
  usersById: Map<string, PublicUser>;
  bundle?: CustomerRelationshipBundle;
}) {
  const travellersQuery = useBookingTravellersQuery(booking.id);
  const paymentsQuery = useBookingPaymentsQuery(booking.id);
  const documentsQuery = useBookingDocumentsQuery(booking.id);
  const notesQuery = useBookingNotesQuery(booking.id);
  const timelineQuery = useBookingTimelineQuery(booking.id);
  const statusHistoryQuery = useBookingStatusHistoryQuery(booking.id);

  const confirm = useConfirmBookingMutation(booking.id);
  const cancel = useCancelBookingMutation(booking.id);
  const ticket = useTicketBookingMutation(booking.id);
  const complete = useCompleteBookingMutation(booking.id);
  const recordPayment = useRecordPaymentMutation(booking.id);
  const addTraveller = useAddTravellerMutation(booking.id);
  const removeTraveller = useRemoveTravellerMutation(booking.id);
  const addDocument = useAddDocumentMutation(booking.id);
  const addNote = useAddNoteMutation(booking.id);
  const updateBooking = useUpdateBookingMutation(booking.id);
  const generateVoucher = useGenerateVoucherMutation(booking.id);
  const generateInvoice = useGenerateInvoiceMutation(booking.id);

  const [cancelReason, setCancelReason] = useState("");
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "", reference: "" });
  const [travellerForm, setTravellerForm] = useState({ fullName: "", email: "", passportNumber: "", nationality: "" });
  const [documentForm, setDocumentForm] = useState<{ kind: string; fileName: string; notes: string }>({
    kind: DocumentKind.PASSPORT,
    fileName: "",
    notes: "",
  });
  const [noteBody, setNoteBody] = useState("");
  const [internalNotes, setInternalNotes] = useState(booking.internalNotes ?? "");
  const [voucherPreview, setVoucherPreview] = useState<BookingVoucher | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<BookingInvoice | null>(null);

  const balance = booking.totalAmount - booking.amountPaid;
  const customerLabel = resolveCustomerLabel(booking, usersById, booking.sourceQuoteNumber);
  const related = getRelatedRecordsForBooking(booking, bundle, users);

  const mergedTimeline = useMemo(
    () =>
      mergeBookingTimeline(
        timelineQuery.data ?? [],
        statusHistoryQuery.data ?? [],
        paymentsQuery.data ?? [],
        notesQuery.data ?? [],
        travellersQuery.data ?? []
      ),
    [timelineQuery.data, statusHistoryQuery.data, paymentsQuery.data, notesQuery.data, travellersQuery.data]
  );

  const canConfirm = booking.status === BookingStatus.DRAFT;
  const canCancel = booking.status !== BookingStatus.COMPLETED && booking.status !== BookingStatus.CANCELLED;
  const canTicket = booking.status === BookingStatus.PAID;
  const canComplete = booking.status === BookingStatus.TICKETED;
  const canPay =
    booking.status === BookingStatus.CONFIRMED ||
    booking.status === BookingStatus.PARTIALLY_PAID ||
    booking.status === BookingStatus.PAID;

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{booking.bookingNumber}</h3>
            <p className="text-xs text-muted-foreground">Quote {booking.sourceQuoteNumber}</p>
          </div>
          <div className="flex gap-2">
            <BookingStatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.paymentStatus} />
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-2 text-sm">
          <DetailRow label="Customer" value={customerLabel} />
          <DetailRow label="Package" value={booking.packageId ?? "—"} />
          <DetailRow label="Destination" value={booking.destinationId} />
          <DetailRow label="Created" value={formatBookingDate(booking.createdAt)} />
        </dl>
        <div className="flex flex-wrap gap-3 text-sm">
          {booking.customerId && (
            <Link href={`/customers?selected=${booking.customerId}`} className="text-primary hover:underline">
              View customer
            </Link>
          )}
          <Link href={`/quotes?selected=${booking.sourceQuoteId}`} className="text-primary hover:underline">
            View source quote
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Actions</h4>
        <div className="flex flex-wrap gap-2">
          {canConfirm && (
            <ActionButton label="Confirm" pending={confirm.isPending} onClick={() => void confirm.mutateAsync().catch(() => undefined)} />
          )}
          {canTicket && (
            <ActionButton label="Ticket" pending={ticket.isPending} onClick={() => void ticket.mutateAsync().catch(() => undefined)} />
          )}
          {canComplete && (
            <ActionButton label="Complete" pending={complete.isPending} onClick={() => void complete.mutateAsync().catch(() => undefined)} />
          )}
          <ActionButton
            label="Generate voucher"
            pending={generateVoucher.isPending}
            onClick={() => void generateVoucher.mutateAsync().then(setVoucherPreview).catch(() => undefined)}
          />
          <ActionButton
            label="Generate invoice"
            pending={generateInvoice.isPending}
            onClick={() => void generateInvoice.mutateAsync().then(setInvoicePreview).catch(() => undefined)}
          />
        </div>
        {canCancel && (
          <div className="flex gap-2">
            <input
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Cancellation reason"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={cancel.isPending || !cancelReason.trim()}
              onClick={() => void cancel.mutateAsync(cancelReason.trim()).catch(() => undefined)}
              className="rounded-md border border-destructive text-destructive px-3 py-2 text-sm disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Customer relationship</h4>
        <RelationshipStage label="Enquiries" count={related.enquiries.length}>
          {related.enquiries.slice(0, 3).map((item) => (
            <li key={item.id} className="rounded-md border border-border px-3 py-2 text-sm">
              {item.name} · {item.status}
            </li>
          ))}
        </RelationshipStage>
        <div className="flex justify-center text-muted-foreground"><ArrowDown className="h-4 w-4" /></div>
        <RelationshipStage label="Quotes" count={related.quotes.length}>
          {related.quotes.slice(0, 3).map((item) => (
            <li key={item.id} className="rounded-md border border-border px-3 py-2 text-sm">
              {item.quoteNumber} · {item.status}
            </li>
          ))}
        </RelationshipStage>
        <div className="flex justify-center text-muted-foreground"><ArrowDown className="h-4 w-4" /></div>
        <RelationshipStage label="Bookings" count={related.bookings.length}>
          {related.bookings.slice(0, 3).map((item) => (
            <li key={item.id} className="rounded-md border border-border px-3 py-2 text-sm">
              {item.bookingNumber} · {item.status}
            </li>
          ))}
        </RelationshipStage>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Payments</h4>
        <div className="rounded-lg border border-border p-3 space-y-2 text-sm">
          <DetailRow label="Total" value={formatBookingMoney(booking.totalAmount, booking.currency)} />
          <DetailRow label="Paid" value={formatBookingMoney(booking.amountPaid, booking.currency)} />
          <DetailRow label="Balance" value={formatBookingMoney(balance, booking.currency)} />
          <DetailRow label="Status" value={booking.paymentStatus} />
        </div>
        <p className="text-xs text-muted-foreground">Totals from booking aggregate fields — no payment gateway integrated.</p>
        {paymentsQuery.isLoading ? (
          <WidgetLoading label="Loading payments…" />
        ) : (
          <ul className="space-y-2 text-sm">
            {(paymentsQuery.data ?? []).map((payment) => (
              <li key={payment.id} className="rounded-md border border-border px-3 py-2">
                {formatBookingMoney(payment.amount, payment.currency)} · {payment.method ?? "Manual"} · {payment.status}
                <div className="text-xs text-muted-foreground mt-0.5">
                  {payment.paidAt ? formatBookingDate(payment.paidAt) : formatBookingDate(payment.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
        {canPay && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="number"
              min={1}
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm((c) => ({ ...c, amount: e.target.value }))}
              placeholder="Amount"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              value={paymentForm.method}
              onChange={(e) => setPaymentForm((c) => ({ ...c, method: e.target.value }))}
              placeholder="Method"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm((c) => ({ ...c, reference: e.target.value }))}
              placeholder="Reference"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={recordPayment.isPending || !paymentForm.amount}
              onClick={() =>
                void recordPayment
                  .mutateAsync({
                    amount: Number(paymentForm.amount),
                    method: paymentForm.method || null,
                    reference: paymentForm.reference || null,
                    status: PaymentStatus.PAID,
                  })
                  .then(() => setPaymentForm({ amount: "", method: "", reference: "" }))
                  .catch(() => undefined)
              }
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
            >
              Record payment
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Travellers</h4>
        {travellersQuery.isLoading ? (
          <WidgetLoading label="Loading travellers…" />
        ) : (
          <ul className="space-y-2 text-sm">
            {(travellersQuery.data ?? []).map((traveller) => (
              <li key={traveller.id} className="rounded-md border border-border px-3 py-2">
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="font-medium">
                      {traveller.fullName}
                      {traveller.isLeadTraveller && (
                        <span className="ml-2 text-xs text-primary">Lead</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {traveller.type} · DOB {traveller.dateOfBirth ?? "—"} · {traveller.nationality ?? "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Passport {traveller.passportNumber ?? "—"} · exp {traveller.passportExpiry ?? "—"}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={removeTraveller.isPending}
                    onClick={() => void removeTraveller.mutateAsync(traveller.id).catch(() => undefined)}
                    className="text-xs text-destructive hover:underline shrink-0"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
            {!travellersQuery.data?.length && <li className="text-muted-foreground">No travellers yet.</li>}
          </ul>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            value={travellerForm.fullName}
            onChange={(e) => setTravellerForm((c) => ({ ...c, fullName: e.target.value }))}
            placeholder="Full name"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            value={travellerForm.email}
            onChange={(e) => setTravellerForm((c) => ({ ...c, email: e.target.value }))}
            placeholder="Email"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            value={travellerForm.passportNumber}
            onChange={(e) => setTravellerForm((c) => ({ ...c, passportNumber: e.target.value }))}
            placeholder="Passport number"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            value={travellerForm.nationality}
            onChange={(e) => setTravellerForm((c) => ({ ...c, nationality: e.target.value }))}
            placeholder="Nationality"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={addTraveller.isPending || !travellerForm.fullName.trim()}
            onClick={() =>
              void addTraveller
                .mutateAsync({
                  fullName: travellerForm.fullName.trim(),
                  email: travellerForm.email || null,
                  passportNumber: travellerForm.passportNumber || null,
                  nationality: travellerForm.nationality || null,
                  type: TravellerType.ADULT,
                })
                .then(() => setTravellerForm({ fullName: "", email: "", passportNumber: "", nationality: "" }))
                .catch(() => undefined)
            }
            className="md:col-span-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
          >
            Add traveller
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Documents</h4>
        <p className="text-xs text-muted-foreground">Metadata records only — file upload/storage not wired; fileUrl stays null.</p>
        {documentsQuery.isLoading ? (
          <WidgetLoading label="Loading documents…" />
        ) : (
          <ul className="space-y-2 text-sm">
            {(documentsQuery.data ?? []).map((doc) => (
              <li key={doc.id} className="rounded-md border border-border px-3 py-2">
                {doc.kind} · {doc.fileName ?? "No file"} · {formatBookingDate(doc.createdAt)}
              </li>
            ))}
          </ul>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select
            value={documentForm.kind}
            onChange={(e) => setDocumentForm((c) => ({ ...c, kind: e.target.value }))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {Object.values(DocumentKind).map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
          <input
            value={documentForm.fileName}
            onChange={(e) => setDocumentForm((c) => ({ ...c, fileName: e.target.value }))}
            placeholder="File name"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={addDocument.isPending}
            onClick={() =>
              void addDocument
                .mutateAsync({
                  kind: documentForm.kind,
                  fileName: documentForm.fileName || null,
                  notes: documentForm.notes || null,
                })
                .then(() => setDocumentForm({ kind: DocumentKind.PASSPORT, fileName: "", notes: "" }))
                .catch(() => undefined)
            }
            className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
          >
            Add document record
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Notes</h4>
        <ul className="space-y-2 text-sm">
          {(notesQuery.data ?? []).map((note) => (
            <li key={note.id} className="rounded-md border border-border px-3 py-2 whitespace-pre-wrap">
              {note.body}
              <div className="text-xs text-muted-foreground mt-1">{formatBookingDate(note.createdAt)}</div>
            </li>
          ))}
        </ul>
        <textarea
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
          rows={2}
          placeholder="Add a note…"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={addNote.isPending || !noteBody.trim()}
          onClick={() => void addNote.mutateAsync(noteBody.trim()).then(() => setNoteBody("")).catch(() => undefined)}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
        >
          Add note
        </button>
        <textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          rows={2}
          placeholder="Internal notes…"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={updateBooking.isPending}
          onClick={() => void updateBooking.mutateAsync({ internalNotes: internalNotes || null }).catch(() => undefined)}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
        >
          Save internal notes
        </button>
      </section>

      {voucherPreview && (
        <PreviewPanel title={`Voucher ${voucherPreview.voucherNumber}`} onClose={() => setVoucherPreview(null)}>
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{JSON.stringify(voucherPreview, null, 2)}</pre>
        </PreviewPanel>
      )}

      {invoicePreview && (
        <PreviewPanel title={`Invoice ${invoicePreview.invoiceNumber}`} onClose={() => setInvoicePreview(null)}>
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{JSON.stringify(invoicePreview, null, 2)}</pre>
        </PreviewPanel>
      )}

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Status history</h4>
        <ul className="space-y-2 text-sm">
          {(statusHistoryQuery.data ?? []).map((entry) => (
            <li key={entry.id} className="rounded-md border border-border px-3 py-2">
              {entry.fromStatus ?? "—"} → {entry.toStatus}
              <div className="text-xs text-muted-foreground mt-0.5">{formatBookingDate(entry.changedAt)}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Timeline</h4>
        <p className="text-xs text-muted-foreground">Merged client-side from timeline, status history, payments, notes, and travellers.</p>
        <ul className="space-y-2 text-sm">
          {mergedTimeline.map((event) => (
            <li key={`${event.kind}-${event.id}`} className="rounded-md border border-border px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium capitalize">{event.kind}</span>
                <span className="text-xs text-muted-foreground">{formatBookingDate(event.occurredAt)}</span>
              </div>
              <div className="mt-1">{event.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.subtitle}</div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="font-medium break-all">{value}</dd>
    </div>
  );
}

function ActionButton({ label, pending, onClick }: { label: string; pending: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
    >
      {pending ? "…" : label}
    </button>
  );
}

function RelationshipStage({ label, count, children }: { label: string; count: number; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs font-medium rounded-full bg-primary/10 text-primary px-2 py-0.5">{count}</span>
      </div>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function PreviewPanel({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <section className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{title}</h4>
        <button type="button" onClick={onClose} className="text-xs text-muted-foreground hover:underline">
          Close
        </button>
      </div>
      <p className="text-xs text-muted-foreground">PDF rendering not installed — data model preview only.</p>
      {children}
    </section>
  );
}
