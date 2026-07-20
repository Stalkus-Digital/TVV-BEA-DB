"use client";

import { Mail, Phone, Trash2 } from "lucide-react";
import { ENQUIRY_TYPE_LABELS } from "../constants";
import { useDeleteEnquiryMutation } from "../hooks/useEnquiryMutations";
import type { Enquiry, PaginatedEnquiries } from "../types";
import { enquiryContextLabel, enquiryDetailsSummary, formatEnquiryDate } from "../utils";
import { EnquiryStatusBadge } from "./EnquiryStatusBadge";
import { WidgetEmpty, WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

interface EnquiriesTableProps {
  data?: PaginatedEnquiries;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onSelect: (id: string) => void;
  page: number;
  onPageChange: (page: number) => void;
}

export function EnquiriesTable({
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onSelect,
  page,
  onPageChange,
}: EnquiriesTableProps) {
  if (isLoading) return <WidgetLoading label="Loading enquiries…" />;
  if (isError) return <WidgetError message={errorMessage ?? "Failed to load enquiries"} onRetry={onRetry} />;
  if (!data?.items.length) return <WidgetEmpty message="No enquiries match your filters" />;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Details</th>
              <th className="px-4 py-3 font-semibold">Context</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((enquiry) => (
              <EnquiryRow key={enquiry.id} enquiry={enquiry} onSelect={onSelect} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
        <span className="text-muted-foreground">
          Page {data.page} of {data.totalPages} · {data.total} total
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= data.totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

function EnquiryRow({
  enquiry,
  onSelect,
}: {
  enquiry: Enquiry;
  onSelect: (id: string) => void;
}) {
  const deleteMutation = useDeleteEnquiryMutation();
  const detailLines = enquiryDetailsSummary(enquiry);
  const typeLabel = ENQUIRY_TYPE_LABELS[enquiry.type] ?? enquiry.type;

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete lead “${enquiry.name}”? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(enquiry.id);
    } catch {
      // mutation surfaces via isError if needed
    }
  }

  return (
    <tr className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onSelect(enquiry.id)}>
      <td className="px-4 py-3 font-semibold whitespace-nowrap">{enquiry.name}</td>
      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Mail className="h-3 w-3" /> {enquiry.email}
        </div>
        {enquiry.phone && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <Phone className="h-3 w-3" /> {enquiry.phone}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {detailLines.length > 0 ? (
          <div className="flex flex-col gap-0.5 text-xs max-w-[180px]">
            {detailLines.slice(0, 3).map((line) => (
              <span key={line} className="truncate">
                {line}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs">{typeLabel}</span>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-primary text-xs font-medium">
        {enquiryContextLabel(enquiry)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <EnquiryStatusBadge status={enquiry.status} />
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
        {formatEnquiryDate(enquiry.createdAt)}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          title="Delete contact"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </td>
    </tr>
  );
}
