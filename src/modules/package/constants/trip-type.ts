export const PackageTripType = {
  HONEYMOON: "HONEYMOON",
  FAMILY: "FAMILY",
  LUXURY: "LUXURY",
  ADVENTURE: "ADVENTURE",
  GROUP: "GROUP",
} as const;

export type PackageTripType = (typeof PackageTripType)[keyof typeof PackageTripType];

export const PACKAGE_TRIP_TYPE_VALUES = Object.values(PackageTripType);

export const PACKAGE_TRIP_TYPE_LABELS: Record<PackageTripType, string> = {
  HONEYMOON: "Honeymoon packages",
  FAMILY: "Family tours packages",
  LUXURY: "Luxury packages",
  ADVENTURE: "Adventure packages",
  GROUP: "Group packages",
};

export function packageTripTypeLabel(value: PackageTripType | null | undefined): string | null {
  if (!value) return null;
  return PACKAGE_TRIP_TYPE_LABELS[value] ?? value;
}

export function isPackageTripType(value: string): value is PackageTripType {
  return (PACKAGE_TRIP_TYPE_VALUES as string[]).includes(value);
}
