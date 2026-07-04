/**
 * Immutable snapshot created whenever a quote is sent to a customer — same
 * freeze principle as PackageVersion. No user-attribution field: no
 * auth/user system exists anywhere in this codebase yet.
 */
export interface QuoteVersion {
  id: string;
  quoteId: string;
  versionNumber: number;
  snapshot: unknown;
  createdAt: string;
  changeNote: string | null;
}
