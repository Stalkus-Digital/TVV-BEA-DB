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
  useRefundBookingMutation,
  useReconcilePaymentsMutation,
  useRemoveDocumentMutation,
  useRemoveTravellerMutation,
  useTicketBookingMutation,
  useUpdateBookingMutation,
  useUpdateDocumentMutation,
  useUpdateTravellerMutation,
} from "../hooks/useBookingMutations";
import {
  useBookingDocumentsQuery,
  useBookingInvoicesQuery,
  useBookingNotesQuery,
  useBookingPaymentsQuery,
  useBookingTravellersQuery,
  useBookingVouchersQuery,
} from "../hooks/useBookingSubQueries";
import { useBookingQuery } from "../hooks/useBookingQuery";
import type { Booking, BookingInvoice, BookingVoucher, Traveller } from "../types";
import {
  formatBookingDate,
  formatBookingMoney,
  getRelatedRecordsForBooking,
  resolveBookingContact,
  resolveCustomerLabel,
} from "../utils";
import { assessTravellerCompleteness, downloadJson, missingDocumentWarnings } from "../traveller-utils";
import { BookingStatusBadge, PaymentStatusBadge } from "./BookingStatusBadge";
import { BookingActivityTimeline } from "./BookingActivityTimeline";
import { DocumentKind, TravellerType } from "../constants";
import { WidgetEmpty, WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

type DrawerToast = (type: "success" | "error" | "info", title: string, message?: string) => void;

interface BookingDetailDrawerProps {
  bookingId: string | null;
  users: PublicUser[];
  bundle?: CustomerRelationshipBundle;
  onClose: () => void;
  onToast?: DrawerToast;
}

function BookingDetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-40 rounded bg-muted" />
      <div className="h-4 w-64 rounded bg-muted" />
      <div className="h-24 rounded bg-muted" />
      <div className="h-32 rounded bg-muted" />
      <div className="h-40 rounded bg-muted" />
    </div>
  );
}

export function BookingDetailDrawer({ bookingId, users, bundle, onClose, onToast }: BookingDetailDrawerProps) {
  const bookingQuery = useBookingQuery(bookingId);
  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  if (!bookingId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close booking detail" />
      <div className="relative w-full max-w-2xl h-full bg-white border-l border-border shadow-xl overflow-y-auto">
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
            <BookingDetailSkeleton />
          ) : bookingQuery.isError || !bookingQuery.data ? (
            <WidgetError message="Failed to load booking" onRetry={() => void bookingQuery.refetch()} />
          ) : (
            <BookingDetailContent
              booking={bookingQuery.data}
              users={users}
              usersById={usersById}
              bundle={bundle}
              onToast={onToast}
            />
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
  onToast,
}: {
  booking: Booking;
  users: PublicUser[];
  usersById: Map<string, PublicUser>;
  bundle?: CustomerRelationshipBundle;
  onToast?: DrawerToast;
}) {
  const travellersQuery = useBookingTravellersQuery(booking.id);
  const paymentsQuery = useBookingPaymentsQuery(booking.id);
  const documentsQuery = useBookingDocumentsQuery(booking.id);
  const invoicesQuery = useBookingInvoicesQuery(booking.id);
  const vouchersQuery = useBookingVouchersQuery(booking.id);
  const notesQuery = useBookingNotesQuery(booking.id);

  const confirm = useConfirmBookingMutation(booking.id);
  const cancel = useCancelBookingMutation(booking.id);
  const ticket = useTicketBookingMutation(booking.id);
  const complete = useCompleteBookingMutation(booking.id);
  const recordPayment = useRecordPaymentMutation(booking.id);
  const refundPayment = useRefundBookingMutation(booking.id);
  const reconcilePayments = useReconcilePaymentsMutation(booking.id);
  const addTraveller = useAddTravellerMutation(booking.id);
  const updateTraveller = useUpdateTravellerMutation(booking.id);
  const removeTraveller = useRemoveTravellerMutation(booking.id);
  const addDocument = useAddDocumentMutation(booking.id);
  const updateDocument = useUpdateDocumentMutation(booking.id);
  const removeDocument = useRemoveDocumentMutation(booking.id);
  const addNote = useAddNoteMutation(booking.id);
  const updateBooking = useUpdateBookingMutation(booking.id);
  const generateVoucher = useGenerateVoucherMutation(booking.id);
  const generateInvoice = useGenerateInvoiceMutation(booking.id);

  const [cancelReason, setCancelReason] = useState("");
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "CASH", reference: "" });
  const [refundForm, setRefundForm] = useState({ amount: "", reason: "" });
  const [travellerForm, setTravellerForm] = useState<{
    fullName: string;
    email: string;
    passportNumber: string;
    nationality: string;
    type: string;
    dateOfBirth: string;
    isLeadTraveller: boolean;
  }>({
    fullName: "",
    email: "",
    passportNumber: "",
    nationality: "",
    type: TravellerType.ADULT,
    dateOfBirth: "",
    isLeadTraveller: false,
  });
  const [editingTravellerId, setEditingTravellerId] = useState<string | null>(null);
  const [documentForm, setDocumentForm] = useState<{
    kind: string;
    fileName: string;
    notes: string;
    travellerId: string;
    expiresAt: string;
    verificationStatus: string;
  }>({
    kind: DocumentKind.PASSPORT,
    fileName: "",
    notes: "",
    travellerId: "",
    expiresAt: "",
    verificationStatus: "PENDING",
  });
  const [noteBody, setNoteBody] = useState("");
  const [internalNotes, setInternalNotes] = useState(booking.internalNotes ?? "");
  const [voucherPreview, setVoucherPreview] = useState<BookingVoucher | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<BookingInvoice | null>(null);

  const balance = Math.max(0, booking.totalAmount - booking.amountPaid);
  const refundedAmount = useMemo(
    () =>
      (paymentsQuery.data ?? [])
        .filter((p) => p.status === PaymentStatus.REFUNDED)
        .reduce((sum, p) => sum + p.amount, 0),
    [paymentsQuery.data]
  );
  const customerLabel = resolveCustomerLabel(booking, usersById, booking.sourceQuoteNumber);
  const related = getRelatedRecordsForBooking(booking, bundle, users);
  const contact = resolveBookingContact(
    { ...booking, travellers: travellersQuery.data ?? booking.travellers },
    customerLabel
  );
  const website = contact.website;
  const category = booking.bookingCategory ?? "PACKAGE";

  const notify = (type: "success" | "error" | "info", title: string, message?: string) => {
    onToast?.(type, title, message);
  };

  const run = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      notify("success", label);
    } catch (error) {
      notify("error", `${label} failed`, error instanceof Error ? error.message : "Unexpected error");
    }
  };

  const canConfirm = booking.status === BookingStatus.DRAFT;
  const canCancel = booking.status !== BookingStatus.COMPLETED && booking.status !== BookingStatus.CANCELLED;
  const canTicket = booking.status === BookingStatus.PAID;
  const canComplete = booking.status === BookingStatus.TICKETED;
  const canPay =
    booking.status === BookingStatus.CONFIRMED ||
    booking.status === BookingStatus.PARTIALLY_PAID ||
    booking.status === BookingStatus.PAID;
  const canRecordPayment = canPay && balance > 0;
  const canRefund = booking.amountPaid > 0 && booking.status !== BookingStatus.CANCELLED;
  const travellers = travellersQuery.data ?? [];
  const documents = documentsQuery.data ?? [];
  const docWarnings = useMemo(() => missingDocumentWarnings(travellers, documents), [travellers, documents]);
  const incompleteCount = useMemo(
    () => travellers.filter((t) => !assessTravellerCompleteness(t).complete).length,
    [travellers]
  );

  const beginEditTraveller = (traveller: Traveller) => {
    setEditingTravellerId(traveller.id);
    setTravellerForm({
      fullName: traveller.fullName,
      email: traveller.email ?? "",
      passportNumber: traveller.passportNumber ?? "",
      nationality: traveller.nationality ?? "",
      type: traveller.type,
      dateOfBirth: traveller.dateOfBirth ? traveller.dateOfBirth.slice(0, 10) : "",
      isLeadTraveller: traveller.isLeadTraveller,
    });
  };

  const resetTravellerForm = () => {
    setEditingTravellerId(null);
    setTravellerForm({
      fullName: "",
      email: "",
      passportNumber: "",
      nationality: "",
      type: TravellerType.ADULT,
      dateOfBirth: "",
      isLeadTraveller: false,
    });
  };

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{booking.bookingNumber}</h3>
            <p className="text-xs text-muted-foreground">
              {category === "HOTEL" ? "Hotel" : category === "ACTIVITY" ? "Activity" : "Holiday"} · Quote{" "}
              {booking.sourceQuoteNumber}
            </p>
          </div>
          <div className="flex gap-2">
            <BookingStatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.paymentStatus} />
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-2 text-sm rounded-lg border border-border p-3">
          <DetailRow label="Customer" value={customerLabel} />
          <DetailRow label="Contact" value={contact.name} />
          <DetailRow label="Email" value={contact.email} />
          <DetailRow label="Phone" value={contact.phone} />
          <DetailRow label="Package" value={booking.packageId ?? "—"} />
          <DetailRow label="Destination" value={booking.destinationId} />
          <DetailRow label="Created" value={formatBookingDate(booking.createdAt)} />
        </dl>
        {(website?.hotelName || website?.activityName || website?.packageName || website?.checkIn || booking.items?.length) && (
          <dl className="grid grid-cols-1 gap-2 text-sm rounded-lg border border-border p-3 bg-muted/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Product details</p>
            {website?.hotelName && <DetailRow label="Hotel" value={website.hotelName} />}
            {website?.roomName && <DetailRow label="Room" value={website.roomName} />}
            {website?.activityName && <DetailRow label="Activity" value={website.activityName} />}
            {website?.packageName && <DetailRow label="Package name" value={website.packageName} />}
            {website?.location && <DetailRow label="Location" value={website.location} />}
            {website?.checkIn && <DetailRow label="Check-in" value={String(website.checkIn)} />}
            {website?.checkOut && <DetailRow label="Check-out" value={String(website.checkOut)} />}
            {website?.startDate && <DetailRow label="Start date" value={String(website.startDate)} />}
            {(website?.guests ?? website?.guestCount) != null && (
              <DetailRow label="Guests" value={String(website?.guests ?? website?.guestCount)} />
            )}
            {(booking.items ?? []).map((item) => (
              <DetailRow key={item.id} label={item.kind} value={`${item.title} × ${item.quantity}`} />
            ))}
          </dl>
        )}
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
            <ActionButton
              label={incompleteCount > 0 || travellers.length === 0 ? "Confirm (travellers incomplete)" : "Confirm"}
              pending={confirm.isPending}
              onClick={() => void run("Booking confirmed", () => confirm.mutateAsync())}
            />
          )}
          {canTicket && (
            <ActionButton label="Ticket" pending={ticket.isPending} onClick={() => void run("Booking ticketed", () => ticket.mutateAsync())} />
          )}
          {canComplete && (
            <ActionButton label="Complete" pending={complete.isPending} onClick={() => void run("Booking completed", () => complete.mutateAsync())} />
          )}
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
              onClick={() => void run("Booking cancelled", () => cancel.mutateAsync(cancelReason.trim()))}
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
          <DetailRow label="Booking total" value={formatBookingMoney(booking.totalAmount, booking.currency)} />
          <DetailRow label="Amount paid" value={formatBookingMoney(booking.amountPaid, booking.currency)} />
          <DetailRow label="Pending balance" value={formatBookingMoney(balance, booking.currency)} />
          <DetailRow label="Refunded" value={formatBookingMoney(refundedAmount, booking.currency)} />
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-muted-foreground">Payment status</span>
            <PaymentStatusBadge status={booking.paymentStatus} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Manual and gateway payments (Razorpay / PhonePe). Payment is optional — bookings can stay unpaid.
        </p>
        {paymentsQuery.isLoading ? (
          <WidgetLoading label="Loading payments…" />
        ) : !(paymentsQuery.data ?? []).length ? (
          <p className="text-sm text-muted-foreground">No payment records yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {(paymentsQuery.data ?? []).map((payment) => (
              <li key={payment.id} className="rounded-md border border-border px-3 py-2">
                <div className="flex justify-between gap-2">
                  <span>
                    {formatBookingMoney(payment.amount, payment.currency)} · {payment.method ?? "Manual"} ·{" "}
                    {payment.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {payment.reference ? `Ref ${payment.reference} · ` : ""}
                  {payment.paidAt ? formatBookingDate(payment.paidAt) : formatBookingDate(payment.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
        {canRecordPayment && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="number"
              min={1}
              max={balance}
              step="0.01"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm((c) => ({ ...c, amount: e.target.value }))}
              placeholder={`Amount (max ${balance})`}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm((c) => ({ ...c, method: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card (offline)</option>
              <option value="ADJUSTMENT">Manual adjustment</option>
            </select>
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
                void run("Payment recorded", async () => {
                  const amount = Number(paymentForm.amount);
                  if (!(amount > 0) || amount > balance) {
                    throw new Error(`Amount must be between 0 and outstanding ₹${balance}`);
                  }
                  await recordPayment.mutateAsync({
                    amount,
                    method: paymentForm.method || null,
                    reference: paymentForm.reference || null,
                    status: PaymentStatus.PAID,
                  });
                  setPaymentForm({ amount: "", method: "CASH", reference: "" });
                })
              }
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
            >
              Record payment
            </button>
          </div>
        )}
        {canRefund && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="number"
              min={1}
              max={booking.amountPaid}
              step="0.01"
              value={refundForm.amount}
              onChange={(e) => setRefundForm((c) => ({ ...c, amount: e.target.value }))}
              placeholder={`Refund amount (blank = full ₹${booking.amountPaid})`}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              value={refundForm.reason}
              onChange={(e) => setRefundForm((c) => ({ ...c, reason: e.target.value }))}
              placeholder="Reason (optional)"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={refundPayment.isPending}
              onClick={() =>
                void run("Refund recorded", async () => {
                  const amount = refundForm.amount ? Number(refundForm.amount) : undefined;
                  if (amount !== undefined && (!(amount > 0) || amount > booking.amountPaid)) {
                    throw new Error(`Refund must be between 0 and amount paid ₹${booking.amountPaid}`);
                  }
                  await refundPayment.mutateAsync({
                    amount,
                    reason: refundForm.reason || undefined,
                  });
                  setRefundForm({ amount: "", reason: "" });
                })
              }
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
            >
              Refund
            </button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={reconcilePayments.isPending}
            onClick={() =>
              void (async () => {
                try {
                  const result = await reconcilePayments.mutateAsync();
                  if (result.corrected > 0) {
                    notify("success", "Reconcile corrected", `${result.corrected} record(s) updated`);
                  } else {
                    notify(
                      "info",
                      "Reconcile complete",
                      result.details.slice(0, 2).join("; ") || "No corrections needed"
                    );
                  }
                } catch (error) {
                  notify(
                    "error",
                    "Reconcile failed",
                    error instanceof Error ? error.message : "Unexpected error"
                  );
                }
              })()
            }
            className="rounded-md border border-border px-3 py-2 text-xs hover:bg-muted disabled:opacity-60"
          >
            Reconcile gateway payments
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold">Travellers</h4>
          {travellers.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {travellers.length - incompleteCount}/{travellers.length} complete
            </span>
          )}
        </div>
        {travellersQuery.isLoading ? (
          <WidgetLoading label="Loading travellers…" />
        ) : (
          <ul className="space-y-2 text-sm">
            {travellers.map((traveller) => {
              const completeness = assessTravellerCompleteness(traveller);
              return (
                <li key={traveller.id} className="rounded-md border border-border px-3 py-2">
                  <div className="flex justify-between gap-2">
                    <div>
                      <div className="font-medium">
                        {traveller.fullName}
                        {traveller.isLeadTraveller && (
                          <span className="ml-2 text-xs text-primary">Lead</span>
                        )}
                        <span
                          className={`ml-2 text-xs ${completeness.complete ? "text-green-700" : "text-amber-700"}`}
                        >
                          {completeness.complete ? "Complete" : `Incomplete: ${completeness.missing.join(", ")}`}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {traveller.type} · DOB {traveller.dateOfBirth ? formatBookingDate(traveller.dateOfBirth) : "—"} ·{" "}
                        {traveller.nationality ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Passport {traveller.passportNumber ?? "—"} · exp{" "}
                        {traveller.passportExpiry ? formatBookingDate(traveller.passportExpiry) : "—"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => beginEditTraveller(traveller)}
                        className="text-xs text-primary hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={removeTraveller.isPending}
                        onClick={() => void run("Traveller removed", () => removeTraveller.mutateAsync(traveller.id))}
                        className="text-xs text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
            {!travellers.length && (
              <li>
                <WidgetEmpty message="No travellers yet." />
              </li>
            )}
          </ul>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            value={travellerForm.fullName}
            onChange={(e) => setTravellerForm((c) => ({ ...c, fullName: e.target.value }))}
            placeholder="Full name"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <select
            value={travellerForm.type}
            onChange={(e) => setTravellerForm((c) => ({ ...c, type: e.target.value }))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {Object.values(TravellerType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            value={travellerForm.email}
            onChange={(e) => setTravellerForm((c) => ({ ...c, email: e.target.value }))}
            placeholder="Email"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={travellerForm.dateOfBirth}
            onChange={(e) => setTravellerForm((c) => ({ ...c, dateOfBirth: e.target.value }))}
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
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={travellerForm.isLeadTraveller}
              onChange={(e) => setTravellerForm((c) => ({ ...c, isLeadTraveller: e.target.checked }))}
            />
            Lead traveller
          </label>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="button"
              disabled={
                (editingTravellerId ? updateTraveller.isPending : addTraveller.isPending) ||
                !travellerForm.fullName.trim()
              }
              onClick={() =>
                void run(editingTravellerId ? "Traveller updated" : "Traveller added", async () => {
                  const payload = {
                    fullName: travellerForm.fullName.trim(),
                    email: travellerForm.email || null,
                    passportNumber: travellerForm.passportNumber || null,
                    nationality: travellerForm.nationality || null,
                    type: travellerForm.type,
                    dateOfBirth: travellerForm.dateOfBirth || null,
                    isLeadTraveller: travellerForm.isLeadTraveller,
                  };
                  if (editingTravellerId) {
                    await updateTraveller.mutateAsync({ travellerId: editingTravellerId, input: payload });
                  } else {
                    await addTraveller.mutateAsync(payload);
                  }
                  resetTravellerForm();
                })
              }
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
            >
              {editingTravellerId ? "Save traveller" : "Add traveller"}
            </button>
            {editingTravellerId && (
              <button
                type="button"
                onClick={resetTravellerForm}
                className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
              >
                Cancel edit
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Documents</h4>
        <p className="text-xs text-muted-foreground">
          Passport, visa, national ID, and other travel documents. File blob storage may be metadata-only until upload
          is wired.
        </p>
        {docWarnings.length > 0 && (
          <ul className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 space-y-1">
            {docWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
        {documentsQuery.isLoading ? (
          <WidgetLoading label="Loading documents…" />
        ) : !(documents.length) ? (
          <WidgetEmpty message="No documents yet." />
        ) : (
          <ul className="space-y-2 text-sm">
            {documents.map((doc) => (
              <li key={doc.id} className="rounded-md border border-border px-3 py-2">
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="font-medium">
                      {doc.kind} · {doc.fileName ?? "No file"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Upload {doc.uploadStatus ?? "—"} · Verify {doc.verificationStatus ?? "PENDING"}
                      {doc.expiresAt ? ` · Expires ${formatBookingDate(doc.expiresAt)}` : ""}
                      {doc.isExpired ? " · Expired" : ""}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {doc.verificationStatus !== "VERIFIED" && (
                      <button
                        type="button"
                        disabled={updateDocument.isPending}
                        onClick={() =>
                          void run("Document verified", () =>
                            updateDocument.mutateAsync({
                              documentId: doc.id,
                              input: { verificationStatus: "VERIFIED" },
                            })
                          )
                        }
                        className="text-xs text-primary hover:underline"
                      >
                        Mark verified
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={removeDocument.isPending}
                      onClick={() => void run("Document deleted", () => removeDocument.mutateAsync(doc.id))}
                      className="text-xs text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
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
            {[DocumentKind.PASSPORT, DocumentKind.VISA, DocumentKind.NATIONAL_ID, DocumentKind.OTHER].map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
          <select
            value={documentForm.travellerId}
            onChange={(e) => setDocumentForm((c) => ({ ...c, travellerId: e.target.value }))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Traveller (optional)</option>
            {travellers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName}
              </option>
            ))}
          </select>
          <input
            value={documentForm.fileName}
            onChange={(e) => setDocumentForm((c) => ({ ...c, fileName: e.target.value }))}
            placeholder="File name"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={documentForm.expiresAt}
            onChange={(e) => setDocumentForm((c) => ({ ...c, expiresAt: e.target.value }))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <select
            value={documentForm.verificationStatus}
            onChange={(e) => setDocumentForm((c) => ({ ...c, verificationStatus: e.target.value }))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="PENDING">PENDING</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <button
            type="button"
            disabled={addDocument.isPending}
            onClick={() =>
              void run("Document uploaded", async () => {
                await addDocument.mutateAsync({
                  kind: documentForm.kind,
                  fileName: documentForm.fileName || null,
                  notes: documentForm.notes || null,
                  travellerId: documentForm.travellerId || null,
                  expiresAt: documentForm.expiresAt || null,
                  verificationStatus: documentForm.verificationStatus,
                });
                setDocumentForm({
                  kind: DocumentKind.PASSPORT,
                  fileName: "",
                  notes: "",
                  travellerId: "",
                  expiresAt: "",
                  verificationStatus: "PENDING",
                });
              })
            }
            className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
          >
            Add document
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Invoices & vouchers</h4>
        <div className="flex flex-wrap gap-2">
          <ActionButton
            label="Generate voucher"
            pending={generateVoucher.isPending}
            onClick={() =>
              void run("Voucher generated", async () => {
                const voucher = await generateVoucher.mutateAsync();
                setVoucherPreview(voucher);
                void vouchersQuery.refetch();
              })
            }
          />
          <ActionButton
            label="Generate invoice"
            pending={generateInvoice.isPending}
            onClick={() =>
              void run("Invoice generated", async () => {
                const invoice = await generateInvoice.mutateAsync();
                setInvoicePreview(invoice);
                void invoicesQuery.refetch();
              })
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Invoices</p>
            {invoicesQuery.isLoading ? (
              <WidgetLoading label="Loading invoices…" />
            ) : !(invoicesQuery.data ?? []).length ? (
              <p className="text-sm text-muted-foreground">No invoices generated.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {(invoicesQuery.data ?? []).map((invoice) => (
                  <li key={invoice.id} className="rounded-md border border-border px-3 py-2">
                    <div className="font-medium">{invoice.invoiceNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      Status Generated · {formatBookingDate(invoice.issuedAt)} ·{" "}
                      {formatBookingMoney(invoice.total, invoice.currency)}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => setInvoicePreview(invoice)}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => downloadJson(`${invoice.invoiceNumber}.json`, invoice)}
                      >
                        Download
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-lg border border-border p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vouchers</p>
            {vouchersQuery.isLoading ? (
              <WidgetLoading label="Loading vouchers…" />
            ) : !(vouchersQuery.data ?? []).length ? (
              <p className="text-sm text-muted-foreground">No vouchers generated.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {(vouchersQuery.data ?? []).map((voucher) => (
                  <li key={voucher.id} className="rounded-md border border-border px-3 py-2">
                    <div className="font-medium">{voucher.voucherNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      Status Generated · {formatBookingDate(voucher.issuedAt)} · {voucher.leadTravellerName}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => setVoucherPreview(voucher)}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => downloadJson(`${voucher.voucherNumber}.json`, voucher)}
                      >
                        Download
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Notes</h4>
        {notesQuery.isLoading ? (
          <WidgetLoading label="Loading notes…" />
        ) : !(notesQuery.data?.length) ? (
          <WidgetEmpty message="No notes yet." />
        ) : (
          <ul className="space-y-2 text-sm">
            {(notesQuery.data ?? []).map((note) => (
              <li key={note.id} className="rounded-md border border-border px-3 py-2 whitespace-pre-wrap">
                {note.body}
                <div className="text-xs text-muted-foreground mt-1">{formatBookingDate(note.createdAt)}</div>
              </li>
            ))}
          </ul>
        )}
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
          onClick={() =>
            void run("Note added", async () => {
              await addNote.mutateAsync(noteBody.trim());
              setNoteBody("");
            })
          }
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
        >
          Add note
        </button>
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Staff internal notes (free text). Website product payloads may also live in this field as JSON —
            prefer structured travellers / booking items above when available.
          </p>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={2}
            placeholder="Staff internal notes…"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={updateBooking.isPending}
            onClick={() =>
              void run("Internal notes saved", () => updateBooking.mutateAsync({ internalNotes: internalNotes || null }))
            }
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
          >
            Save internal notes
          </button>
        </div>
      </section>

      {voucherPreview && (
        <PreviewPanel
          title={`Voucher ${voucherPreview.voucherNumber}`}
          onClose={() => setVoucherPreview(null)}
          onDownload={() => downloadJson(`${voucherPreview.voucherNumber}.json`, voucherPreview)}
        >
          <dl className="grid grid-cols-1 gap-1 text-sm">
            <DetailRow label="Status" value="Generated" />
            <DetailRow label="Lead" value={voucherPreview.leadTravellerName} />
            <DetailRow label="Destination" value={voucherPreview.destinationName} />
            <DetailRow label="Issued" value={formatBookingDate(voucherPreview.issuedAt)} />
          </dl>
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap mt-2">{JSON.stringify(voucherPreview, null, 2)}</pre>
        </PreviewPanel>
      )}

      {invoicePreview && (
        <PreviewPanel
          title={`Invoice ${invoicePreview.invoiceNumber}`}
          onClose={() => setInvoicePreview(null)}
          onDownload={() => downloadJson(`${invoicePreview.invoiceNumber}.json`, invoicePreview)}
        >
          <dl className="grid grid-cols-1 gap-1 text-sm">
            <DetailRow label="Status" value="Generated" />
            <DetailRow label="Total" value={formatBookingMoney(invoicePreview.total, invoicePreview.currency)} />
            <DetailRow label="Amount due" value={formatBookingMoney(invoicePreview.amountDue, invoicePreview.currency)} />
            <DetailRow label="Issued" value={formatBookingDate(invoicePreview.issuedAt)} />
          </dl>
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap mt-2">{JSON.stringify(invoicePreview, null, 2)}</pre>
        </PreviewPanel>
      )}

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Activity timeline</h4>
        <p className="text-xs text-muted-foreground">
          Append-only history from audit logs, status changes, payments, notes, documents, and travellers.
        </p>
        <BookingActivityTimeline bookingId={booking.id} />
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

function PreviewPanel({
  title,
  onClose,
  onDownload,
  children,
}: {
  title: string;
  onClose: () => void;
  onDownload?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">{title}</h4>
        <div className="flex gap-2">
          {onDownload && (
            <button type="button" onClick={onDownload} className="text-xs text-primary hover:underline">
              Download
            </button>
          )}
          <button type="button" onClick={onClose} className="text-xs text-muted-foreground hover:underline">
            Close
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">PDF rendering not installed — structured data preview / JSON download.</p>
      {children}
    </section>
  );
}
