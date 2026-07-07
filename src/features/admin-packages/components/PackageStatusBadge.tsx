import type { PackageStatus } from "../constants";
import { PACKAGE_STATUS_LABELS } from "../constants";

const STATUS_STYLES: Record<PackageStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ARCHIVED: "bg-amber-50 text-amber-800 border-amber-200",
};

interface PackageStatusBadgeProps {
  status: PackageStatus;
}

export function PackageStatusBadge({ status }: PackageStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[status]}`}>
      {PACKAGE_STATUS_LABELS[status]}
    </span>
  );
}
