import { ENQUIRY_STATUS_LABELS, STATUS_BADGE_CLASSES } from "../constants";
import type { EnquiryStatus } from "../types";

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_BADGE_CLASSES[status]}`}>
      {ENQUIRY_STATUS_LABELS[status]}
    </span>
  );
}
