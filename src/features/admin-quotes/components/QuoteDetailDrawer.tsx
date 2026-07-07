"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDown, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { CustomerRelationshipBundle } from "@/features/admin-customers/types";
import type { PublicUser } from "@/features/admin-customers/types";
import { AdjustmentKind, AdjustmentType, DECIDABLE_QUOTE_STATUSES, EDITABLE_QUOTE_STATUSES } from "../constants";
import {
  useAddQuoteItemMutation,
  useApproveQuoteMutation,
  useConvertQuoteMutation,
  useDeleteQuoteItemMutation,
  useDuplicateQuoteMutation,
  useRejectQuoteMutation,
  useSendQuoteMutation,
  useUpdateQuoteMutation,
} from "../hooks/useQuoteMutations";
import { useQuoteItemsQuery } from "../hooks/useQuoteItemsQuery";
import { useQuotePricingQuery } from "../hooks/useQuotePricingQuery";
import { useQuoteQuery } from "../hooks/useQuoteQuery";
import { useQuoteVersionsQuery } from "../hooks/useQuoteVersionsQuery";
import { QuoteStatus, type Quote } from "../types";
import {
  buildQuoteTimeline,
  formatQuoteDate,
  formatQuoteMoney,
  getRelatedBookingsForQuote,
  getRelatedEnquiriesForQuote,
  resolveCustomerLabel,
  resolveCustomerUserId,
} from "../utils";
import { QuoteStatusBadge } from "./QuoteStatusBadge";
import { WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

interface QuoteDetailDrawerProps {
  quoteId: string | null;
  users: PublicUser[];
  bundle?: CustomerRelationshipBundle;
  onClose: () => void;
  onSelectQuote?: (id: string) => void;
}

export function QuoteDetailDrawer({ quoteId, users, bundle, onClose, onSelectQuote }: QuoteDetailDrawerProps) {
  const quoteQuery = useQuoteQuery(quoteId);
  const itemsQuery = useQuoteItemsQuery(quoteId);
  const pricingQuery = useQuotePricingQuery(quoteId);
  const versionsQuery = useQuoteVersionsQuery(quoteId);

  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  if (!quoteId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close quote detail" />
      <div className="relative w-full max-w-2xl h-full bg-card border-l border-border shadow-xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Quote Detail</h2>
            <p className="text-xs text-muted-foreground font-mono">{quoteId}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {quoteQuery.isLoading ? (
            <WidgetLoading label="Loading quote…" />
          ) : quoteQuery.isError || !quoteQuery.data ? (
            <WidgetError message="Failed to load quote" onRetry={() => void quoteQuery.refetch()} />
          ) : (
            <QuoteDetailContent
              quote={quoteQuery.data}
              users={users}
              usersById={usersById}
              bundle={bundle}
              items={itemsQuery.data ?? []}
              itemsLoading={itemsQuery.isLoading}
              pricing={pricingQuery.data}
              pricingLoading={pricingQuery.isLoading}
              versions={versionsQuery.data ?? []}
              onSelectQuote={onSelectQuote}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function QuoteDetailContent({
  quote,
  users,
  usersById,
  bundle,
  items,
  itemsLoading,
  pricing,
  pricingLoading,
  versions,
  onSelectQuote,
}: {
  quote: Quote;
  users: PublicUser[];
  usersById: Map<string, PublicUser>;
  bundle?: CustomerRelationshipBundle;
  items: ReturnType<typeof useQuoteItemsQuery>["data"];
  itemsLoading: boolean;
  pricing: ReturnType<typeof useQuotePricingQuery>["data"];
  pricingLoading: boolean;
  versions: NonNullable<ReturnType<typeof useQuoteVersionsQuery>["data"]>;
  onSelectQuote?: (id: string) => void;
}) {
  const editable = EDITABLE_QUOTE_STATUSES.includes(quote.status);
  const decidable = DECIDABLE_QUOTE_STATUSES.includes(quote.status);
  const customerUserId = resolveCustomerUserId(quote, users);
  const customerLabel = resolveCustomerLabel(quote, usersById);

  const updateQuote = useUpdateQuoteMutation(quote.id);
  const sendQuote = useSendQuoteMutation(quote.id);
  const approveQuote = useApproveQuoteMutation(quote.id);
  const rejectQuote = useRejectQuoteMutation(quote.id);
  const duplicateQuote = useDuplicateQuoteMutation(quote.id);
  const convertQuote = useConvertQuoteMutation(quote.id);
  const addItem = useAddQuoteItemMutation(quote.id);
  const deleteItem = useDeleteQuoteItemMutation(quote.id);

  const [rejectReason, setRejectReason] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [convertResult, setConvertResult] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState(quote.internalNotes ?? "");
  const [newItem, setNewItem] = useState({ title: "", quantity: 1, unitPrice: 0 });

  const timeline = useMemo(() => buildQuoteTimeline(quote, versions), [quote, versions]);
  const relatedEnquiries = getRelatedEnquiriesForQuote(quote, bundle, users);
  const relatedBookings = getRelatedBookingsForQuote(quote, bundle, users);
  const relatedQuotes =
    bundle?.quotes.filter((item) => {
      if (item.id === quote.id) return true;
      if (quote.customerId && item.customerId === quote.customerId) return true;
      return false;
    }) ?? [quote];

  const markups = quote.adjustments.filter((item) => item.kind === AdjustmentKind.MARKUP);
  const discounts = quote.adjustments.filter((item) => item.kind === AdjustmentKind.DISCOUNT);

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{quote.title}</h3>
            <p className="text-xs font-mono text-muted-foreground">{quote.quoteNumber}</p>
          </div>
          <QuoteStatusBadge status={quote.status} />
        </div>
        <dl className="grid grid-cols-1 gap-2 text-sm">
          <DetailRow label="Customer" value={customerLabel} />
          <DetailRow label="Email" value={quote.travelerDetails.leadTraveler.email} />
          <DetailRow label="Phone" value={quote.travelerDetails.leadTraveler.phone ?? "—"} />
          <DetailRow label="Package" value={quote.packageId ?? "—"} />
          <DetailRow label="Valid from" value={formatQuoteDate(quote.validFrom)} />
          <DetailRow label="Valid until" value={formatQuoteDate(quote.validTo)} />
          <DetailRow label="Assigned staff" value="— (not on Quote model)" />
        </dl>
        {customerUserId && (
          <Link href={`/customers?selected=${customerUserId}`} className="text-sm text-primary hover:underline">
            View customer profile
          </Link>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Actions</h4>
        <div className="flex flex-wrap gap-2">
          {editable && (
            <button
              type="button"
              disabled={sendQuote.isPending}
              onClick={() => void sendQuote.mutateAsync(sendNote || undefined).catch(() => undefined)}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
            >
              Send
            </button>
          )}
          {decidable && (
            <>
              <button
                type="button"
                disabled={approveQuote.isPending}
                onClick={() => void approveQuote.mutateAsync().catch(() => undefined)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={rejectQuote.isPending || !rejectReason.trim()}
                onClick={() => void rejectQuote.mutateAsync(rejectReason.trim()).catch(() => undefined)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
              >
                Reject
              </button>
            </>
          )}
          {quote.status === QuoteStatus.APPROVED && (
            <button
              type="button"
              disabled={convertQuote.isPending}
              onClick={() =>
                void convertQuote
                  .mutateAsync()
                  .then((payload) => setConvertResult(`${payload.quoteNumber} handoff at ${formatQuoteDate(payload.convertedAt)}`))
                  .catch(() => undefined)
              }
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
            >
              Convert to booking
            </button>
          )}
          <button
            type="button"
            disabled={duplicateQuote.isPending}
            onClick={() =>
              void duplicateQuote
                .mutateAsync()
                .then((created) => onSelectQuote?.(created.id))
                .catch(() => undefined)
            }
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
          >
            Duplicate
          </button>
        </div>
        {editable && (
          <input
            value={sendNote}
            onChange={(e) => setSendNote(e.target.value)}
            placeholder="Optional send change note"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        )}
        {decidable && (
          <input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Rejection reason (required to reject)"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        )}
        {convertResult && <p className="text-xs text-emerald-700">{convertResult}</p>}
        <p className="text-xs text-muted-foreground">
          Delete quote is not supported — no <code className="text-[11px]">DELETE /api/quotes/:id</code> endpoint exists.
        </p>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Customer relationship</h4>
        <p className="text-xs text-muted-foreground">Enquiries → Quotes → Bookings (from shared customer cache)</p>
        <div className="space-y-2">
          <RelationshipStage label="Enquiries" count={relatedEnquiries.length}>
            {relatedEnquiries.slice(0, 3).map((item) => (
              <li key={item.id} className="rounded-md border border-border px-3 py-2 text-sm">
                {item.name} · {item.status}
              </li>
            ))}
          </RelationshipStage>
          <div className="flex justify-center text-muted-foreground"><ArrowDown className="h-4 w-4" /></div>
          <RelationshipStage label="Quotes" count={relatedQuotes.length}>
            {relatedQuotes.slice(0, 3).map((item) => (
              <li key={item.id} className="rounded-md border border-border px-3 py-2 text-sm">
                <button
                  type="button"
                  className="text-left hover:underline"
                  onClick={() => item.id !== quote.id && onSelectQuote?.(item.id)}
                >
                  {item.quoteNumber} · {item.title} · {item.status}
                </button>
              </li>
            ))}
          </RelationshipStage>
          <div className="flex justify-center text-muted-foreground"><ArrowDown className="h-4 w-4" /></div>
          <RelationshipStage label="Bookings" count={relatedBookings.length}>
            {relatedBookings.slice(0, 3).map((item) => (
              <li key={item.id} className="rounded-md border border-border px-3 py-2 text-sm">
                {item.bookingNumber} · {item.status}
              </li>
            ))}
          </RelationshipStage>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Pricing</h4>
        {pricingLoading ? (
          <WidgetLoading label="Loading pricing…" />
        ) : pricing ? (
          <div className="rounded-lg border border-border p-3 space-y-2 text-sm">
            <DetailRow label="Subtotal" value={formatQuoteMoney(pricing.itemsSubtotal, pricing.currency)} />
            {markups.map((item) => (
              <DetailRow
                key={item.id}
                label={`Markup: ${item.label}`}
                value={`${item.type === AdjustmentType.PERCENTAGE ? `${item.value}%` : formatQuoteMoney(item.value, quote.currency)}`}
              />
            ))}
            {discounts.map((item) => (
              <DetailRow
                key={item.id}
                label={`Discount: ${item.label}`}
                value={`${item.type === AdjustmentType.PERCENTAGE ? `${item.value}%` : formatQuoteMoney(item.value, quote.currency)}`}
              />
            ))}
            <DetailRow label="Taxes" value="— (not in Quote Engine)" />
            <DetailRow label="Total" value={formatQuoteMoney(pricing.total, pricing.currency)} />
            <ul className="pt-2 border-t border-border space-y-1 text-xs text-muted-foreground">
              {pricing.lineItems.map((line, index) => (
                <li key={`${line.label}-${index}`} className="flex justify-between">
                  <span>{line.label}</span>
                  <span>{formatQuoteMoney(line.amount, pricing.currency)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Pricing unavailable</p>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Line items</h4>
        {itemsLoading ? (
          <WidgetLoading label="Loading items…" />
        ) : (
          <ul className="space-y-2 text-sm">
            {(items ?? []).map((item) => (
              <li key={item.id} className="rounded-md border border-border px-3 py-2 flex justify-between gap-3">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.kind} · qty {item.quantity} × {formatQuoteMoney(item.unitPrice, quote.currency)}
                  </div>
                </div>
                {editable && (
                  <button
                    type="button"
                    disabled={deleteItem.isPending}
                    onClick={() => void deleteItem.mutateAsync(item.id).catch(() => undefined)}
                    className="text-xs text-destructive hover:underline shrink-0"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
            {!items?.length && <li className="text-muted-foreground">No line items yet.</li>}
          </ul>
        )}
        {editable && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              value={newItem.title}
              onChange={(e) => setNewItem((current) => ({ ...current, title: e.target.value }))}
              placeholder="Item title"
              className="md:col-span-2 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={1}
              value={newItem.quantity}
              onChange={(e) => setNewItem((current) => ({ ...current, quantity: Number(e.target.value) || 1 }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={0}
              value={newItem.unitPrice}
              onChange={(e) => setNewItem((current) => ({ ...current, unitPrice: Number(e.target.value) || 0 }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={addItem.isPending || !newItem.title.trim()}
              onClick={() =>
                void addItem
                  .mutateAsync({
                    title: newItem.title.trim(),
                    quantity: newItem.quantity,
                    unitPrice: newItem.unitPrice,
                  })
                  .then(() => setNewItem({ title: "", quantity: 1, unitPrice: 0 }))
                  .catch(() => undefined)
              }
              className="md:col-span-4 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
            >
              Add custom item
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Internal notes</h4>
        {editable ? (
          <>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={updateQuote.isPending}
              onClick={() => void updateQuote.mutateAsync({ internalNotes: editNotes || null }).catch(() => undefined)}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
            >
              Save notes
            </button>
          </>
        ) : (
          <p className="text-sm whitespace-pre-wrap rounded-lg border border-border bg-muted/20 p-3">
            {quote.internalNotes ?? "—"}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Version history</h4>
        {!versions.length ? (
          <p className="text-sm text-muted-foreground">No versions yet — send the quote to create version 1.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {versions.map((version) => (
              <li key={version.id} className="rounded-md border border-border px-3 py-2">
                <div className="font-medium">Version {version.versionNumber}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatQuoteDate(version.createdAt)}
                  {version.changeNote ? ` · ${version.changeNote}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Timeline</h4>
        <ul className="space-y-2 text-sm">
          {timeline.map((event) => (
            <li key={event.id} className="rounded-md border border-border px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium capitalize">{event.kind}</span>
                <span className="text-xs text-muted-foreground">{formatQuoteDate(event.createdAt)}</span>
              </div>
              <div className="mt-1">{event.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{event.subtitle}</div>
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
      <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="font-medium break-all">{value}</dd>
    </div>
  );
}

function RelationshipStage({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: ReactNode;
}) {
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
