import { EnquiryStatus, EnquiryType } from "./types";

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

export const ENQUIRY_TYPE_LABELS: Record<EnquiryType, string> = {
  GENERAL: "General",
  PACKAGE: "Package",
  DESTINATION: "Destination",
  HOTEL: "Hotel",
  ACTIVITY: "Activity",
  CALLBACK: "Callback",
  CORPORATE: "Corporate",
};

export const CRM_COLUMNS: { status: EnquiryStatus; title: string; color: string }[] = [
  { status: EnquiryStatus.NEW, title: "New Leads", color: "bg-blue-500" },
  { status: EnquiryStatus.CONTACTED, title: "Contacted", color: "bg-amber-500" },
  { status: EnquiryStatus.CONVERTED, title: "Converted", color: "bg-emerald-500" },
  { status: EnquiryStatus.CLOSED, title: "Closed", color: "bg-slate-400" },
];

export const STATUS_BADGE_CLASSES: Record<EnquiryStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-amber-100 text-amber-700",
  CONVERTED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-700",
};
