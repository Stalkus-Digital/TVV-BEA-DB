export const QuoteItemKind = {
  PACKAGE: "PACKAGE",
  INVENTORY: "INVENTORY",
  CUSTOM: "CUSTOM",
} as const;

export type QuoteItemKind = (typeof QuoteItemKind)[keyof typeof QuoteItemKind];

/**
 * title/description/unitPrice are snapshotted at add-time, not resolved
 * live from Package/Inventory on every read — a quote is a commercial
 * document whose line items must stay stable even if the referenced
 * catalog record changes later (same freeze reasoning as PackageVersion's
 * snapshot, applied per-line instead of per-document).
 */
export interface QuoteItem {
  id: string;
  quoteId: string;
  kind: QuoteItemKind;
  packageId: string | null;
  inventoryItemId: string | null;
  title: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}
