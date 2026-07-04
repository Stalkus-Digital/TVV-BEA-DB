/**
 * Immutable snapshot created on publish — same freeze principle used
 * throughout this project (Inventory items frozen into booking_items in the
 * original schema drafts). No user-attribution field: no auth/user system
 * exists anywhere in this codebase yet, so publishedByUserId is not
 * invented here.
 */
export interface PackageVersion {
  id: string;
  packageId: string;
  versionNumber: number;
  snapshot: unknown;
  publishedAt: string;
  changeNote: string | null;
}
