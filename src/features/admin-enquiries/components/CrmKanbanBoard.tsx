"use client";

import { Calendar, Mail, MoreHorizontal, Phone } from "lucide-react";
import { CRM_COLUMNS, ENQUIRY_TYPE_LABELS } from "../constants";
import type { Enquiry } from "../types";
import { enquiryContextLabel, relativeEnquiryDate } from "../utils";
import { WidgetEmpty, WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

interface CrmKanbanBoardProps {
  enquiries?: Enquiry[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onSelect: (id: string) => void;
}

export function CrmKanbanBoard({ enquiries = [], isLoading, isError, errorMessage, onRetry, onSelect }: CrmKanbanBoardProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <WidgetLoading label="Loading leads…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <WidgetError message={errorMessage ?? "Failed to load leads"} onRetry={onRetry} />
      </div>
    );
  }

  if (enquiries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <WidgetEmpty message="No leads match your filters" />
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6 pb-4 min-w-max">
      {CRM_COLUMNS.map((column) => {
        const columnItems = enquiries.filter((item) => item.status === column.status);
        return (
          <div key={column.status} className="w-80 flex flex-col shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-sm tracking-tight">{column.title}</h3>
                <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                  {columnItems.length}
                </span>
              </div>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex-1 space-y-3">
              {columnItems.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onSelect={onSelect} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeadCard({ lead, onSelect }: { lead: Enquiry; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(lead.id)}
      className="w-full text-left bg-card border border-border rounded-lg shadow-sm p-4 hover:border-primary/50 hover:shadow-md transition-all"
    >
      <div className="mb-2">
        <span className="text-xs font-medium text-muted-foreground font-mono">{lead.id.slice(0, 8)}…</span>
        <h4 className="font-semibold text-sm text-foreground mt-0.5">{lead.name}</h4>
      </div>

      <div className="space-y-2 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Mail className="h-3 w-3" /> {lead.email}
        </div>
        {lead.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" /> {lead.phone}
          </div>
        )}
        
        {(() => {
          let extra: any = {};
          try { extra = lead.message ? JSON.parse(lead.message) : {}; } catch {}
          
          if (extra.guestCount || extra.total) {
            return (
              <div className="bg-slate-50 p-2 rounded border border-border mt-2 space-y-1">
                {extra.guestCount && <div><strong>Guests:</strong> {extra.guestCount}</div>}
                {extra.total && <div><strong>Total:</strong> {extra.total}</div>}
                {extra.startDate && <div><strong>Start:</strong> {extra.startDate}</div>}
                {extra.location && <div><strong>Location:</strong> {extra.location}</div>}
              </div>
            );
          }
          return null;
        })()}

        <div className="text-primary font-medium bg-primary/5 rounded px-2 py-1 w-fit truncate">
          {enquiryContextLabel(lead)}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" /> {relativeEnquiryDate(lead.createdAt)}
        </div>
      </div>
    </button>
  );
}
