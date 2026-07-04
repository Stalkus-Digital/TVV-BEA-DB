/** A package can have several availability windows (e.g. seasonal on-sale periods), each with its own blackout dates. */
export interface PackageAvailability {
  id: string;
  packageId: string;
  validFrom: string;
  validTo: string;
  blackoutDates: string[];
  maxBookingsPerDay: number | null;
  createdAt: string;
  updatedAt: string;
}
