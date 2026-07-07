"use client";

import { Mail, Phone } from "lucide-react";
import type { CustomerSummary, PaginatedCustomers } from "../types";
import { formatCustomerDate } from "../utils";
import { WidgetEmpty, WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

interface CustomersTableProps {
  data?: PaginatedCustomers;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onSelect: (id: string) => void;
  page: number;
  onPageChange: (page: number) => void;
}

export function CustomersTable({
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onSelect,
  page,
  onPageChange,
}: CustomersTableProps) {
  if (isLoading) return <WidgetLoading label="Loading customers…" />;
  if (isError) return <WidgetError message={errorMessage ?? "Failed to load customers"} onRetry={onRetry} />;
  if (!data?.items.length) return <WidgetEmpty message="No customers match your search" />;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Phone</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Created</th>
              <th className="px-6 py-4 font-semibold">Last Activity</th>
              <th className="px-6 py-4 font-semibold text-center">Enquiries</th>
              <th className="px-6 py-4 font-semibold text-center">Quotes</th>
              <th className="px-6 py-4 font-semibold text-center">Bookings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((customer) => (
              <CustomerRow key={customer.id} customer={customer} onSelect={onSelect} />
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

function CustomerRow({
  customer,
  onSelect,
}: {
  customer: CustomerSummary;
  onSelect: (id: string) => void;
}) {
  return (
    <tr
      className={`hover:bg-muted/50 transition-colors cursor-pointer ${customer.isActive ? "" : "opacity-60"}`}
      onClick={() => onSelect(customer.id)}
    >
      <td className="px-6 py-4 font-semibold whitespace-nowrap">{customer.fullName || "—"}</td>
      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Mail className="h-3 w-3 shrink-0" />
          {customer.email}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
        {customer.phone ? (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 shrink-0" />
            {customer.phone}
          </div>
        ) : (
          "—"
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground" title="Role API unavailable">
        {customer.role ?? "—"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatCustomerDate(customer.createdAt)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
        {customer.lastActivityAt ? formatCustomerDate(customer.lastActivityAt) : "—"}
      </td>
      <td className="px-6 py-4 text-center tabular-nums">{customer.enquiryCount}</td>
      <td className="px-6 py-4 text-center tabular-nums">{customer.quoteCount}</td>
      <td className="px-6 py-4 text-center tabular-nums">{customer.bookingCount}</td>
    </tr>
  );
}
