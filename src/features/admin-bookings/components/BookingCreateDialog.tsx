"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllQuotes } from "@/features/admin-quotes/api/quotes";
import { QuoteStatus } from "@/features/admin-quotes/types";
import { useCreateBookingMutation } from "../hooks/useBookingMutations";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

interface BookingCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (bookingId: string) => void;
}

export function BookingCreateDialog({ open, onClose, onCreated }: BookingCreateDialogProps) {
  const createBooking = useCreateBookingMutation();
  const [quoteId, setQuoteId] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const approvedQuotesQuery = useQuery({
    queryKey: ["admin", "bookings", "approved-quotes"],
    queryFn: () => fetchAllQuotes({ status: QuoteStatus.APPROVED }),
    enabled: open,
  });

  if (!open) return null;

  const submit = async () => {
    const booking = await createBooking.mutateAsync({
      quoteId,
      internalNotes: internalNotes.trim() || null,
    });
    onCreated(booking.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close create booking" />
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Create booking</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-muted-foreground">
            Select an approved quote to create a booking. Approval alone does not create a booking —
            conversion (or Create from quote) is required so the quote is linked via convertedBookingId.
          </p>
          {approvedQuotesQuery.isLoading ? (
            <WidgetLoading label="Loading approved quotes…" />
          ) : (
            <>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Source quote</span>
                <select
                  value={quoteId}
                  onChange={(e) => setQuoteId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select approved quote</option>
                  {(approvedQuotesQuery.data ?? []).map((quote) => (
                    <option key={quote.id} value={quote.id}>
                      {quote.quoteNumber} · {quote.title}
                    </option>
                  ))}
                </select>
              </label>
              {(approvedQuotesQuery.data?.length ?? 0) === 0 && (
                <p className="text-xs text-muted-foreground">No APPROVED quotes available — approve a quote first.</p>
              )}
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Internal notes</span>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
            </>
          )}
          {createBooking.isError && (
            <p className="text-xs text-destructive">
              {createBooking.error instanceof Error ? createBooking.error.message : "Create failed"}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm">
              Cancel
            </button>
            <button
              type="button"
              disabled={createBooking.isPending || !quoteId}
              onClick={() => void submit()}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {createBooking.isPending ? "Creating…" : "Create from quote"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
