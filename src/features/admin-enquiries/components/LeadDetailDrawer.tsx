"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { ENQUIRY_STATUS_LABELS, ENQUIRY_TYPE_LABELS } from "../constants";
import {
  useAssignEnquiryMutation,
  useUpdateEnquiryStatusMutation,
} from "../hooks/useEnquiryMutations";
import { useEnquiryNotesQuery } from "../hooks/useEnquiryNotesQuery";
import { useEnquiryQuery } from "../hooks/useEnquiryQuery";
import { useStaffUsersQuery } from "../hooks/useStaffUsersQuery";
import { EnquiryStatus, type Enquiry } from "../types";
import { enquiryContextLabel, formatEnquiryDate } from "../utils";
import { EnquiryStatusBadge } from "./EnquiryStatusBadge";
import { NotesSection } from "./NotesSection";
import { WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

interface LeadDetailDrawerProps {
  enquiryId: string | null;
  onClose: () => void;
}

export function LeadDetailDrawer({ enquiryId, onClose }: LeadDetailDrawerProps) {
  const enquiryQuery = useEnquiryQuery(enquiryId);
  const staffQuery = useStaffUsersQuery();
  const notesQuery = useEnquiryNotesQuery(enquiryId);

  const staffNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of staffQuery.data ?? []) {
      map.set(user.id, user.fullName || user.email);
    }
    return map;
  }, [staffQuery.data]);

  if (!enquiryId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close lead detail" />
      <div className="relative w-full max-w-lg h-full bg-card border-l border-border shadow-xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Lead Detail</h2>
            <p className="text-xs text-muted-foreground font-mono">{enquiryId}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {enquiryQuery.isLoading ? (
            <WidgetLoading />
          ) : enquiryQuery.isError || !enquiryQuery.data ? (
            <WidgetError message="Failed to load lead" onRetry={() => void enquiryQuery.refetch()} />
          ) : (
            <LeadDetailContent
              enquiry={enquiryQuery.data}
              staffNameById={staffNameById}
              staffUsers={staffQuery.data ?? []}
              staffLoading={staffQuery.isLoading}
              staffError={staffQuery.isError}
              notes={notesQuery.data ?? []}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function LeadDetailContent({
  enquiry,
  staffNameById,
  staffUsers,
  staffLoading,
  staffError,
  notes,
}: {
  enquiry: Enquiry;
  staffNameById: Map<string, string>;
  staffUsers: { id: string; fullName: string; email: string }[];
  staffLoading: boolean;
  staffError: boolean;
  notes: { id: string; body: string; createdAt: string; authorUserId: string | null }[];
}) {
  const updateStatus = useUpdateEnquiryStatusMutation(enquiry.id);
  const assign = useAssignEnquiryMutation(enquiry.id);

  const assignedLabel = enquiry.assignedToUserId
    ? staffNameById.get(enquiry.assignedToUserId) ?? enquiry.assignedToUserId
    : "Unassigned";

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">{enquiry.name}</h3>
          <EnquiryStatusBadge status={enquiry.status} />
        </div>
        <dl className="grid grid-cols-1 gap-2 text-sm">
          <DetailRow label="Email" value={enquiry.email} />
          <DetailRow label="Phone" value={enquiry.phone ?? "—"} />
          <DetailRow label="Type" value={ENQUIRY_TYPE_LABELS[enquiry.type]} />
          <DetailRow label="Context" value={enquiryContextLabel(enquiry)} />
          <DetailRow label="Source" value={enquiry.source ?? "—"} />
          <DetailRow label="Created" value={formatEnquiryDate(enquiry.createdAt)} />
          <DetailRow label="Last updated" value={formatEnquiryDate(enquiry.updatedAt)} />
          <DetailRow label="Assigned to" value={assignedLabel} />
        </dl>
      </section>

      {enquiry.message && (
        <section className="space-y-2">
          <h4 className="text-sm font-semibold">Message</h4>
          <p className="text-sm whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3">{enquiry.message}</p>
        </section>
      )}

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Status</h4>
        <select
          value={enquiry.status}
          disabled={updateStatus.isPending}
          onChange={(e) => updateStatus.mutate(e.target.value as EnquiryStatus)}
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
        >
          {Object.values(EnquiryStatus).map((status) => (
            <option key={status} value={status}>
              {ENQUIRY_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        {updateStatus.isError && (
          <p className="text-xs text-destructive">{updateStatus.error instanceof Error ? updateStatus.error.message : "Status update failed"}</p>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Assignment</h4>
        <select
          value={enquiry.assignedToUserId ?? ""}
          disabled={assign.isPending || staffLoading || staffError || staffUsers.length === 0}
          onChange={(e) => assign.mutate(e.target.value || null)}
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm disabled:opacity-60"
        >
          <option value="">Unassigned</option>
          {staffUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.fullName || user.email}
            </option>
          ))}
        </select>
        {staffError && (
          <p className="text-xs text-muted-foreground">Staff list unavailable — assignment disabled.</p>
        )}
        {!staffError && staffUsers.length === 0 && !staffLoading && (
          <p className="text-xs text-muted-foreground">No staff users found.</p>
        )}
        {assign.isError && (
          <p className="text-xs text-destructive">{assign.error instanceof Error ? assign.error.message : "Assignment failed"}</p>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Activity</h4>
        <p className="text-xs text-muted-foreground">Full status history API is not available — showing created/updated timestamps and notes.</p>
        <ul className="space-y-2 text-sm">
          <li className="rounded-md border border-border px-3 py-2">
            Lead created · {formatEnquiryDate(enquiry.createdAt)}
          </li>
          {enquiry.updatedAt !== enquiry.createdAt && (
            <li className="rounded-md border border-border px-3 py-2">
              Status/assignment updated · {formatEnquiryDate(enquiry.updatedAt)} ({ENQUIRY_STATUS_LABELS[enquiry.status]})
            </li>
          )}
          {notes.map((note) => (
            <li key={note.id} className="rounded-md border border-border px-3 py-2">
              Note · {formatEnquiryDate(note.createdAt)}
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{note.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <NotesSection enquiryId={enquiry.id} staffNameById={staffNameById} />
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
