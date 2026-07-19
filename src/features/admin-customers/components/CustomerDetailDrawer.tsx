"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { useCustomerQuery } from "../hooks/useCustomerQuery";
import type { CustomerRelationshipBundle, PublicUser } from "../types";
import {
  buildCustomerTimeline,
  formatCustomerDate,
  getUserBookings,
  getUserEnquiries,
  getUserQuotes,
} from "../utils";
import { CustomerFunnelView } from "./CustomerFunnelView";
import { WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

interface CustomerDetailDrawerProps {
  userId: string | null;
  bundle?: CustomerRelationshipBundle;
  onClose: () => void;
}

export function CustomerDetailDrawer({ userId, bundle, onClose }: CustomerDetailDrawerProps) {
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
            <h2 className="text-lg font-semibold">Customer Detail</h2>
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
            <CustomerDetailContent user={customerQuery.data} relationship={relationship} />
          )}
        </div>
      </div>
    </div>
  );
}

function CustomerDetailContent({
  user,
  relationship,
}: {
  user: PublicUser;
  relationship: {
    enquiries: ReturnType<typeof getUserEnquiries>;
    quotes: ReturnType<typeof getUserQuotes>;
    bookings: ReturnType<typeof getUserBookings>;
    timeline: ReturnType<typeof buildCustomerTimeline>;
  } | null;
}) {
  const phone =
    relationship?.enquiries
      .filter((item) => item.phone)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.phone ?? null;

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">{user.fullName || user.email}</h3>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                user.emailVerifiedAt ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {user.emailVerifiedAt ? "Email verified" : "Email unverified"}
            </span>
            <span
              className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                user.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-2 text-sm">
          <DetailRow label="Email" value={user.email} />
          <DetailRow
            label="Email verified"
            value={user.emailVerifiedAt ? formatCustomerDate(user.emailVerifiedAt) : "Not verified"}
          />
          <DetailRow label="Phone" value={phone ?? "—"} />
          <DetailRow label="Role" value="— (role API unavailable)" />
          <DetailRow label="Registered" value={formatCustomerDate(user.createdAt)} />
          <DetailRow label="Last login" value={user.lastLoginAt ? formatCustomerDate(user.lastLoginAt) : "—"} />
        </dl>
        <p className="text-xs text-muted-foreground">
          Extended profile fields (passport, nationality, preferences) require manual verification.
          Full profile management self-service features exist via the customer account page.
        </p>
      </section>

      {relationship && (
        <CustomerFunnelView
          enquiries={relationship.enquiries}
          quotes={relationship.quotes}
          bookings={relationship.bookings}
        />
      )}

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Documents</h4>
        <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border bg-muted/20 p-3">
          Customer documents are only available via the secure customer document portal.
        </p>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Timeline</h4>
        <p className="text-xs text-muted-foreground">
          Built from account registration plus linked enquiries, quotes, and bookings — no dedicated customer timeline API.
        </p>
        {!relationship?.timeline.length ? (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {relationship.timeline.map((event) => (
              <li key={`${event.kind}-${event.id}`} className="rounded-md border border-border px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium capitalize">{event.kind}</span>
                  <span className="text-xs text-muted-foreground">{formatCustomerDate(event.createdAt)}</span>
                </div>
                <div className="mt-1">{event.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {event.subtitle} · {event.status}
                </div>
              </li>
            ))}
          </ul>
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
