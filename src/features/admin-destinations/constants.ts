export const DestinationStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type DestinationStatus = (typeof DestinationStatus)[keyof typeof DestinationStatus];

export const DESTINATION_STATUS_LABELS: Record<DestinationStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

export const EDITABLE_DESTINATION_STATUSES: DestinationStatus[] = [
  DestinationStatus.DRAFT,
  DestinationStatus.ACTIVE,
];
