import type { DestinationStatus } from "../constants";
import { DESTINATION_STATUS_LABELS } from "../constants";

const STATUS_STYLES: Record<DestinationStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ARCHIVED: "bg-amber-50 text-amber-800 border-amber-200",
};

interface DestinationStatusBadgeProps {
  status: DestinationStatus;
}

export function DestinationStatusBadge({ status }: DestinationStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[status]}`}>
      {DESTINATION_STATUS_LABELS[status]}
    </span>
  );
}
