"use client";

import { useState } from "react";
import { useCreateCustomerMutation } from "../hooks/useCustomerMutations";

interface CustomerCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (userId: string) => void;
}

export function CustomerCreateDialog({ open, onClose, onCreated }: CustomerCreateDialogProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const createMutation = useCreateCustomerMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    createMutation.mutate(
      { fullName, email, phone: phone || null },
      {
        onSuccess: (data) => {
          setFullName("");
          setEmail("");
          setPhone("");
          onCreated?.(data.id);
          onClose();
        },
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button type="button" className="absolute inset-0 bg-black/50" onClick={onClose} aria-label="Close dialog" />
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Create Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="customer-name" className="text-sm font-medium">Full Name *</label>
            <input
              id="customer-name"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="customer-email" className="text-sm font-medium">Email *</label>
            <input
              id="customer-email"
              type="email"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="customer-phone" className="text-sm font-medium">Phone</label>
            <input
              id="customer-phone"
              type="tel"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {createMutation.isError && (
            <p className="text-xs text-destructive">
              {createMutation.error instanceof Error ? createMutation.error.message : "Failed to create customer"}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="rounded-md border border-input px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !fullName || !email}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating…" : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
