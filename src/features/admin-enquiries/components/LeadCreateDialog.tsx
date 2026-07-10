"use client";

import { useState } from "react";

import { useCreateEnquiryMutation } from "../hooks/useEnquiryMutations";

interface LeadCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (leadId: string) => void;
}

export function LeadCreateDialog({ open, onClose, onCreated }: LeadCreateDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sourceUrl, setSourceUrl] = useState("Manual Entry");

  const createMutation = useCreateEnquiryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    createMutation.mutate(
      { name, email, phone, sourceUrl },
      {
        onSuccess: (data) => {
          setName("");
          setEmail("");
          setPhone("");
          setSourceUrl("Manual Entry");
          onCreated?.(data.id);
          onClose();
        },
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-border p-6 overflow-y-auto max-h-[90vh]">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Create New Lead</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium leading-none">Full Name *</label>
            <input
              id="name"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium leading-none">Email Address *</label>
            <input
              id="email"
              type="email"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="text-sm font-medium leading-none">Phone Number</label>
            <input
              id="phone"
              type="tel"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555 0123"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="sourceUrl" className="text-sm font-medium leading-none">Source</label>
            <input
              id="sourceUrl"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="e.g. Phone Call, Walk-in"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={createMutation.isPending || !name || !email}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            >
              {createMutation.isPending ? "Creating..." : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
