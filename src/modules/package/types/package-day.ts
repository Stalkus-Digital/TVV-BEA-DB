/** Day-level itinerary structure — the fine-grained Time/Notes/Images live on PackageItem, not here. */
export interface PackageDay {
  id: string;
  packageId: string;
  dayNumber: number;
  title: string;
  description: string | null;
  destinationId: string | null;
  createdAt: string;
  updatedAt: string;
}
