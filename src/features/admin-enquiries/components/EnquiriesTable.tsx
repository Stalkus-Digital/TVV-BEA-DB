"use client";

import { Mail, Phone } from "lucide-react";
import { useMemo } from "react";
import { ENQUIRY_TYPE_LABELS } from "../constants";
import { useStaffUsersQuery } from "../hooks/useStaffUsersQuery";
import type { Enquiry, PaginatedEnquiries } from "../types";
import { enquiryContextLabel, formatEnquiryDate } from "../utils";
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
  const staffQuery = useStaffUsersQuery();
  const staffNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of staffQuery.data ?? []) {
      map.set(user.id, user.fullName || user.email);
    }
    return map;
  }, [staffQuery.data]);

  if (isLoading) return <WidgetLoading label="Loading enquiries…" />;
  if (isError) return <WidgetError message={errorMessage ?? "Failed to load enquiries"} onRetry={onRetry} />;
  if (!data?.items.length) return <WidgetEmpty message="No enquiries match your filters" />;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Client</th>
              <th className="px-6 py-4 font-semibold">Contact</th>
              <th className="px-6 py-4 font-semibold">Details</th>
              <th className="px-6 py-4 font-semibold">Context</th>
              <th className="px-6 py-4 font-semibold">Assigned</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((enquiry) => (
              <EnquiryRow
                key={enquiry.id}
                enquiry={enquiry}
                assignedLabel={
                  enquiry.assignedToUserId
                    ? staffNameById.get(enquiry.assignedToUserId) ?? "Unknown user"
                    : "Unassigned"
                }
                onSelect={onSelect}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-border text-sm">
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
  assignedLabel,
  onSelect,
}: {
  enquiry: Enquiry;
  assignedLabel: string;
  onSelect: (id: string) => void;
}) {
  return (
    <tr className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onSelect(enquiry.id)}>
      <td className="px-6 py-4 font-semibold whitespace-nowrap">{enquiry.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Mail className="h-3 w-3" /> {enquiry.email}
        </div>
        {enquiry.phone && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <Phone className="h-3 w-3" /> {enquiry.phone}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
        {(() => {
          let extra: any = {};
          try { extra = enquiry.message ? JSON.parse(enquiry.message) : {}; } catch {}
          
          if (extra.guestCount || extra.total) {
            return (
              <div className="flex flex-col gap-0.5 text-xs">
                {extra.guestCount && <span>Guests: {extra.guestCount}</span>}
                {extra.total && <span>Total: {extra.total}</span>}
                {extra.startDate && <span>Start: {extra.startDate}</span>}
              </div>
            );
          }
          return ENQUIRY_TYPE_LABELS[enquiry.type];
        })()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-primary">{enquiryContextLabel(enquiry)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{assignedLabel}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <EnquiryStatusBadge status={enquiry.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatEnquiryDate(enquiry.createdAt)}</td>
    </tr>
  );
}
