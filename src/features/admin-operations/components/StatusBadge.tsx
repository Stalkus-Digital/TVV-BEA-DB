"use client";

import { statusBadgeClass, formatStatusLabel } from "../utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${statusBadgeClass(status)}`}>
      {formatStatusLabel(status)}
    </span>
  );
}
