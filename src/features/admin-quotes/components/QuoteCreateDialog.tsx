"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { X } from "lucide-react";
import { useCreateQuoteMutation } from "../hooks/useQuoteMutations";
import { useDestinationsQuery } from "../hooks/useDestinationsQuery";
import type { CreateQuoteInput } from "../types";
import { WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

interface QuoteCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (quoteId: string) => void;
}

export function QuoteCreateDialog({ open, onClose, onCreated }: QuoteCreateDialogProps) {
  const destinationsQuery = useDestinationsQuery();
  const createQuote = useCreateQuoteMutation();
  const [form, setForm] = useState({
    title: "",
    destinationId: "",
    leadName: "",
    leadEmail: "",
    leadPhone: "",
    adults: 2,
  });

  if (!open) return null;

  const submit = async () => {
    const input: CreateQuoteInput = {
      title: form.title.trim(),
      destinationId: form.destinationId,
      travelerDetails: {
        leadTraveler: {
          name: form.leadName.trim(),
          email: form.leadEmail.trim(),
          phone: form.leadPhone.trim() || null,
        },
        adults: form.adults,
        children: 0,
        infants: 0,
      },
    };
    const quote = await createQuote.mutateAsync(input);
    onCreated(quote.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close create quote" />
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Create quote</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {destinationsQuery.isLoading ? (
            <WidgetLoading label="Loading destinations…" />
          ) : (
            <>
              <Field label="Title">
                <input
                  value={form.title}
                  onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Andaman 5N package quote"
                />
              </Field>
              <Field label="Destination">
                <select
                  value={form.destinationId}
                  onChange={(e) => setForm((current) => ({ ...current, destinationId: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select destination</option>
                  {(destinationsQuery.data ?? []).map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {destination.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Lead traveler name">
                <input
                  value={form.leadName}
                  onChange={(e) => setForm((current) => ({ ...current, leadName: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Lead traveler email">
                <input
                  type="email"
                  value={form.leadEmail}
                  onChange={(e) => setForm((current) => ({ ...current, leadEmail: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Phone">
                <input
                  value={form.leadPhone}
                  onChange={(e) => setForm((current) => ({ ...current, leadPhone: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Adults">
                <input
                  type="number"
                  min={1}
                  value={form.adults}
                  onChange={(e) => setForm((current) => ({ ...current, adults: Number(e.target.value) || 1 }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </Field>
            </>
          )}

          {createQuote.isError && (
            <p className="text-xs text-destructive">
              {createQuote.error instanceof Error ? createQuote.error.message : "Create failed"}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm">
              Cancel
            </button>
            <button
              type="button"
              disabled={createQuote.isPending || !form.title || !form.destinationId || !form.leadName || !form.leadEmail}
              onClick={() => void submit()}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {createQuote.isPending ? "Creating…" : "Create draft"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
