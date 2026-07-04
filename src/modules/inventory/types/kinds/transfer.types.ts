export const TransferMode = {
  FERRY: "FERRY",
  ROAD: "ROAD",
} as const;

export type TransferMode = (typeof TransferMode)[keyof typeof TransferMode];

/**
 * Covers both ferries and road transfers via `mode` — per the approved
 * Business Objects glossary in CLAUDE.md ("Transfer: An Inventory kind
 * covering ferries, road transfers; mode field distinguishes them"), not a
 * separate top-level FERRY kind.
 */
export interface TransferDetails {
  mode: TransferMode;
  originDestinationId: string;
  targetDestinationId: string;
}
