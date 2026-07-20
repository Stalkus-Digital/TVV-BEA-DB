"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EntityActivityTimeline } from "@/components/admin/EntityActivityTimeline";
import { adminEndpoints } from "@/lib/admin-api/endpoints";
import { useCustomerQuery } from "../hooks/useCustomerQuery";
import { useArchiveCustomerMutation, useRestoreCustomerMutation, useUpdateCustomerMutation } from "../hooks/useCustomerMutations";
import { fetchCustomerPayments } from "../api/users";
import type { CustomerRelationshipBundle } from "../types";
import {
  buildCustomerTimeline,
  formatCustomerDate,
  getUserBookings,
  getUserEnquiries,
  getUserQuotes,
} from "../utils";
import { CustomerFunnelView } from "./CustomerFunnelView";
import { CustomerNotesSection } from "./CustomerNotesSection";
import { WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";
import { adminQueryKeys } from "@/shared/lib/query-client";

interface CustomerDetailDrawerProps {
  userId: string | null;
  bundle?: CustomerRelationshipBundle;
  onClose: () => void;
  onUpdated?: () => void;
}

export function CustomerDetailDrawer({ userId, bundle, onClose, onUpdated }: CustomerDetailDrawerProps) {
  const customerQuery = useCustomerQuery(userId);

  const relationship = useMemo(() => {
    if (!customerQuery.data || !bundle) return null;
    const user = customerQuery.data;
    return {
      enquiries: getUserEnquiries(user, bundle.enquiries),
      quotes: getUserQuotes(user, bundle.quotes),
      bookings: getUserBookings(user, bundle.bookings),
      timeline: buildCustomerTimeline(user, bundle),
    };
  }, [customerQuery.data, bundle]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close customer detail" />
      <div className="relative w-full max-w-lg h-full bg-white border-l border-border shadow-xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Customer Profile</h2>
            <p className="text-xs text-muted-foreground font-mono">{userId}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {customerQuery.isLoading ? (
            <WidgetLoading label="Loading customer…" />
          ) : customerQuery.isError || !customerQuery.data ? (
            <WidgetError message="Failed to load customer" onRetry={() => void customerQuery.refetch()} />
          ) : (
            <CustomerDetailContent
              userId={userId}
              user={customerQuery.data}
              relationship={relationship}
              onUpdated={onUpdated}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CustomerDetailContent({
  userId,
  user,
  relationship,
  onUpdated,
}: {
  userId: string;
  user: ReturnType<typeof useCustomerQuery>["data"] & object;
  relationship: {
    enquiries: ReturnType<typeof getUserEnquiries>;
    quotes: ReturnType<typeof getUserQuotes>;
    bookings: ReturnType<typeof getUserBookings>;
    timeline: ReturnType<typeof buildCustomerTimeline>;
  } | null;
  onUpdated?: () => void;
}) {
  const updateCustomer = useUpdateCustomerMutation(userId);
  const archiveCustomer = useArchiveCustomerMutation();
  const restoreCustomer = useRestoreCustomerMutation();
  const paymentsQuery = useQuery({
    queryKey: adminQueryKeys.customers.payments(userId),
    queryFn: () => fetchCustomerPayments(userId),
  });

  const [editName, setEditName] = useState(user.fullName);
  const [editPhone, setEditPhone] = useState("phone" in user ? String(user.phone ?? "") : "");

  const phone =
    ("phone" in user && user.phone) ||
    relationship?.enquiries
      .filter((item) => item.phone)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.phone ||
    null;

  async function handleSave() {
    await updateCustomer.mutateAsync({
      fullName: editName,
      phone: editPhone || null,
    });
    onUpdated?.();
  }

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">{user.fullName || user.email}</h3>
          <span
            className={`text-xs font-medium rounded-full px-2 py-0.5 ${
              user.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
            }`}
          >
            {user.isActive ? "Active" : "Archived"}
          </span>
        </div>
        <dl className="grid grid-cols-1 gap-2 text-sm">
          <DetailRow label="Email" value={user.email} />
          <DetailRow
            label="Email verified"
            value={user.emailVerifiedAt ? formatCustomerDate(user.emailVerifiedAt) : "Not verified"}
          />
          <DetailRow label="Phone" value={phone ?? "—"} />
          <DetailRow label="Registered" value={formatCustomerDate(user.createdAt)} />
          <DetailRow label="Last login" value={user.lastLoginAt ? formatCustomerDate(user.lastLoginAt) : "—"} />
        </dl>
      </section>

      <section className="space-y-3 border-t border-border pt-4">
        <h4 className="text-sm font-semibold">Edit Profile</h4>
        <div className="space-y-2">
          <input
            className="w-full rounded-md border border-input px-3 py-2 text-sm"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Full name"
          />
          <input
            className="w-full rounded-md border border-input px-3 py-2 text-sm"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="Phone"
          />
          <button
            type="button"
            disabled={updateCustomer.isPending}
            onClick={() => void handleSave()}
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            {updateCustomer.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </section>

      {relationship && (
        <CustomerFunnelView
          enquiries={relationship.enquiries}
          quotes={relationship.quotes}
          bookings={relationship.bookings}
        />
      )}

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Payment History</h4>
        {paymentsQuery.isLoading ? (
          <WidgetLoading label="Loading payments…" />
        ) : !paymentsQuery.data?.length ? (
          <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {paymentsQuery.data.map((payment) => (
              <li key={payment.id} className="rounded-md border border-border px-3 py-2">
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{payment.bookingNumber}</span>
                  <span>
                    {payment.currency} {payment.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {payment.method} · {payment.status} · {formatCustomerDate(payment.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CustomerNotesSection userId={userId} />

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Activity Timeline</h4>
        <EntityActivityTimeline
          endpoint={`${adminEndpoints.customers}/${userId}/audit-logs`}
          eventPrefix="CUSTOMER_"
          queryKey={[userId]}
        />
        {relationship?.timeline.length ? (
          <ul className="space-y-2 text-sm mt-4">
            {relationship.timeline.slice(0, 5).map((event) => (
              <li key={`${event.kind}-${event.id}`} className="rounded-md border border-border px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium capitalize">{event.kind}</span>
                  <span className="text-xs text-muted-foreground">{formatCustomerDate(event.createdAt)}</span>
                </div>
                <div className="mt-1">{event.title}</div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="border-t border-border pt-4 flex gap-2">
        {user.isActive ? (
          <button
            type="button"
            disabled={archiveCustomer.isPending}
            onClick={() => void archiveCustomer.mutateAsync(userId).then(() => onUpdated?.())}
            className="flex-1 rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
          >
            Archive Customer
          </button>
        ) : (
          <button
            type="button"
            disabled={restoreCustomer.isPending}
            onClick={() => void restoreCustomer.mutateAsync(userId).then(() => onUpdated?.())}
            className="flex-1 rounded-md border border-emerald-300 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
          >
            Restore Customer
          </button>
        )}
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
