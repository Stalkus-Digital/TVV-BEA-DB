const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ARCHIVED: "bg-amber-50 text-amber-800 border-amber-200",
  MAINTENANCE: "bg-orange-50 text-orange-800 border-orange-200",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
  MAINTENANCE: "Maintenance",
};

export function InventoryStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700 border-slate-200";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {label}
    </span>
  );
}
