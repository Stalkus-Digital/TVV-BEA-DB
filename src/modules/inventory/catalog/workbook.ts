import { InventoryKind } from "@/modules/inventory/types";

export type WorkbookSheetKey =
  | "Hotels"
  | "Activities"
  | "Flights"
  | "Transfers"
  | "Visa"
  | "Insurance"
  | "Destinations"
  | "Packages";

export interface MetaField {
  sheet: WorkbookSheetKey;
  column: string;
  required: boolean;
  type: string;
  allowedValues: string;
  notes: string;
  example: string;
}

export const SHEET_TO_KIND: Record<string, InventoryKind | "DESTINATION" | "PACKAGE"> = {
  Hotels: InventoryKind.HOTEL,
  Activities: InventoryKind.ACTIVITY,
  Flights: InventoryKind.FLIGHT,
  Transfers: InventoryKind.TRANSFER,
  Visa: InventoryKind.VISA,
  Insurance: InventoryKind.INSURANCE,
  Destinations: "DESTINATION",
  Packages: "PACKAGE",
};

export const KIND_TO_SHEET: Record<string, WorkbookSheetKey> = {
  HOTEL: "Hotels",
  ACTIVITY: "Activities",
  FLIGHT: "Flights",
  TRANSFER: "Transfers",
  VISA: "Visa",
  INSURANCE: "Insurance",
  DESTINATION: "Destinations",
  PACKAGE: "Packages",
};

export const WORKBOOK_SHEETS: WorkbookSheetKey[] = [
  "Hotels",
  "Activities",
  "Flights",
  "Transfers",
  "Visa",
  "Insurance",
  "Destinations",
  "Packages",
];

export const WORKBOOK_META: MetaField[] = [
  // Hotels
  { sheet: "Hotels", column: "id", required: false, type: "string", allowedValues: "", notes: "Leave blank to create; set to update existing", example: "" },
  { sheet: "Hotels", column: "title", required: true, type: "string", allowedValues: "", notes: "Hotel name", example: "Sea Pearl Resort" },
  { sheet: "Hotels", column: "destination", required: false, type: "string", allowedValues: "", notes: "Destination name (matched case-insensitive)", example: "Andaman" },
  { sheet: "Hotels", column: "status", required: false, type: "string", allowedValues: "DRAFT,ACTIVE,ARCHIVED,MAINTENANCE", notes: "Defaults to DRAFT on create", example: "ACTIVE" },
  { sheet: "Hotels", column: "starRating", required: false, type: "number", allowedValues: "1-5", notes: "Defaults to 3", example: "4" },
  { sheet: "Hotels", column: "address", required: false, type: "string", allowedValues: "", notes: "", example: "Port Blair" },
  { sheet: "Hotels", column: "latitude", required: false, type: "number", allowedValues: "", notes: "", example: "11.6234" },
  { sheet: "Hotels", column: "longitude", required: false, type: "number", allowedValues: "", notes: "", example: "92.7265" },

  // Activities
  { sheet: "Activities", column: "id", required: false, type: "string", allowedValues: "", notes: "Leave blank to create", example: "" },
  { sheet: "Activities", column: "title", required: true, type: "string", allowedValues: "", notes: "", example: "Scuba Diving" },
  { sheet: "Activities", column: "destination", required: false, type: "string", allowedValues: "", notes: "Destination name", example: "Andaman" },
  { sheet: "Activities", column: "status", required: false, type: "string", allowedValues: "DRAFT,ACTIVE,ARCHIVED,MAINTENANCE", notes: "", example: "ACTIVE" },
  { sheet: "Activities", column: "durationMinutes", required: false, type: "number", allowedValues: "", notes: "", example: "120" },
  { sheet: "Activities", column: "category", required: false, type: "string", allowedValues: "", notes: "", example: "Water Sports" },

  // Flights
  { sheet: "Flights", column: "id", required: false, type: "string", allowedValues: "", notes: "Leave blank to create", example: "" },
  { sheet: "Flights", column: "title", required: true, type: "string", allowedValues: "", notes: "", example: "DEL-IXZ" },
  { sheet: "Flights", column: "destination", required: false, type: "string", allowedValues: "", notes: "Destination name", example: "Andaman" },
  { sheet: "Flights", column: "status", required: false, type: "string", allowedValues: "DRAFT,ACTIVE,ARCHIVED,MAINTENANCE", notes: "", example: "ACTIVE" },
  { sheet: "Flights", column: "originAirportCode", required: true, type: "string", allowedValues: "3-letter IATA", notes: "", example: "DEL" },
  { sheet: "Flights", column: "destinationAirportCode", required: true, type: "string", allowedValues: "3-letter IATA", notes: "", example: "IXZ" },

  // Transfers
  { sheet: "Transfers", column: "id", required: false, type: "string", allowedValues: "", notes: "Leave blank to create", example: "" },
  { sheet: "Transfers", column: "title", required: true, type: "string", allowedValues: "", notes: "", example: "Port Blair to Havelock" },
  { sheet: "Transfers", column: "destination", required: false, type: "string", allowedValues: "", notes: "Primary destination name", example: "Andaman" },
  { sheet: "Transfers", column: "status", required: false, type: "string", allowedValues: "DRAFT,ACTIVE,ARCHIVED,MAINTENANCE", notes: "", example: "ACTIVE" },
  { sheet: "Transfers", column: "mode", required: true, type: "string", allowedValues: "FERRY,ROAD", notes: "", example: "FERRY" },
  { sheet: "Transfers", column: "originDestination", required: true, type: "string", allowedValues: "", notes: "Origin destination name", example: "Port Blair" },
  { sheet: "Transfers", column: "targetDestination", required: true, type: "string", allowedValues: "", notes: "Target destination name", example: "Havelock" },

  // Visa
  { sheet: "Visa", column: "id", required: false, type: "string", allowedValues: "", notes: "Leave blank to create", example: "" },
  { sheet: "Visa", column: "title", required: true, type: "string", allowedValues: "", notes: "", example: "India Tourist Visa" },
  { sheet: "Visa", column: "destination", required: false, type: "string", allowedValues: "", notes: "", example: "" },
  { sheet: "Visa", column: "status", required: false, type: "string", allowedValues: "DRAFT,ACTIVE,ARCHIVED,MAINTENANCE", notes: "", example: "ACTIVE" },
  { sheet: "Visa", column: "countryId", required: false, type: "string", allowedValues: "", notes: "Country id or ISO code", example: "IN" },
  { sheet: "Visa", column: "country", required: false, type: "string", allowedValues: "", notes: "Country name (fallback)", example: "India" },
  { sheet: "Visa", column: "visaType", required: true, type: "string", allowedValues: "TOURIST,BUSINESS,TRANSIT", notes: "", example: "TOURIST" },
  { sheet: "Visa", column: "entryType", required: true, type: "string", allowedValues: "SINGLE,MULTIPLE", notes: "", example: "SINGLE" },
  { sheet: "Visa", column: "processingDays", required: true, type: "number", allowedValues: "", notes: "", example: "7" },
  { sheet: "Visa", column: "validityDays", required: true, type: "number", allowedValues: "", notes: "", example: "30" },
  { sheet: "Visa", column: "requiredDocuments", required: false, type: "string", allowedValues: "", notes: "Comma-separated list", example: "Passport,Photo" },

  // Insurance
  { sheet: "Insurance", column: "id", required: false, type: "string", allowedValues: "", notes: "Leave blank to create", example: "" },
  { sheet: "Insurance", column: "title", required: true, type: "string", allowedValues: "", notes: "", example: "Travel Cover" },
  { sheet: "Insurance", column: "destination", required: false, type: "string", allowedValues: "", notes: "", example: "" },
  { sheet: "Insurance", column: "status", required: false, type: "string", allowedValues: "DRAFT,ACTIVE,ARCHIVED,MAINTENANCE", notes: "", example: "ACTIVE" },
  { sheet: "Insurance", column: "providerName", required: true, type: "string", allowedValues: "", notes: "", example: "ICICI Lombard" },
  { sheet: "Insurance", column: "coverageAmount", required: true, type: "number", allowedValues: "", notes: "", example: "500000" },
  { sheet: "Insurance", column: "currencyCode", required: true, type: "string", allowedValues: "3-letter", notes: "", example: "INR" },
  { sheet: "Insurance", column: "termDays", required: true, type: "number", allowedValues: "", notes: "", example: "15" },
  { sheet: "Insurance", column: "termsUrl", required: false, type: "string", allowedValues: "", notes: "", example: "" },

  // Destinations
  { sheet: "Destinations", column: "id", required: false, type: "string", allowedValues: "", notes: "Leave blank to create", example: "" },
  { sheet: "Destinations", column: "name", required: true, type: "string", allowedValues: "", notes: "", example: "Havelock Island" },
  { sheet: "Destinations", column: "slug", required: false, type: "string", allowedValues: "", notes: "Auto-derived from name if blank", example: "havelock-island" },
  { sheet: "Destinations", column: "status", required: false, type: "string", allowedValues: "DRAFT,ACTIVE,ARCHIVED", notes: "", example: "ACTIVE" },
  { sheet: "Destinations", column: "country", required: false, type: "string", allowedValues: "", notes: "Country name or ISO", example: "India" },
  { sheet: "Destinations", column: "countryId", required: false, type: "string", allowedValues: "", notes: "Country id if known", example: "" },
  { sheet: "Destinations", column: "parentDestination", required: true, type: "string", allowedValues: "", notes: "Parent destination name or slug (Andaman/Domestic/International)", example: "Andaman" },
  { sheet: "Destinations", column: "description", required: false, type: "string", allowedValues: "", notes: "", example: "" },
  { sheet: "Destinations", column: "latitude", required: false, type: "number", allowedValues: "", notes: "", example: "11.96" },
  { sheet: "Destinations", column: "longitude", required: false, type: "number", allowedValues: "", notes: "", example: "93.00" },
  { sheet: "Destinations", column: "isFeatured", required: false, type: "boolean", allowedValues: "true,false", notes: "", example: "false" },

  // Packages
  { sheet: "Packages", column: "id", required: false, type: "string", allowedValues: "", notes: "Leave blank to create", example: "" },
  { sheet: "Packages", column: "title", required: true, type: "string", allowedValues: "", notes: "", example: "Andaman Escape 4N" },
  { sheet: "Packages", column: "code", required: false, type: "string", allowedValues: "", notes: "Auto from title if blank", example: "AND-ESC-4N" },
  { sheet: "Packages", column: "slug", required: false, type: "string", allowedValues: "", notes: "Auto from title if blank", example: "andaman-escape-4n" },
  { sheet: "Packages", column: "destination", required: true, type: "string", allowedValues: "", notes: "Destination name", example: "Andaman" },
  { sheet: "Packages", column: "status", required: false, type: "string", allowedValues: "DRAFT,PUBLISHED,ARCHIVED", notes: "Import creates DRAFT; status update on existing only", example: "DRAFT" },
  { sheet: "Packages", column: "durationDays", required: true, type: "number", allowedValues: "", notes: "", example: "5" },
  { sheet: "Packages", column: "durationNights", required: true, type: "number", allowedValues: "", notes: "", example: "4" },
  { sheet: "Packages", column: "durationText", required: false, type: "string", allowedValues: "", notes: "", example: "4N/5D" },
  { sheet: "Packages", column: "sourceType", required: false, type: "string", allowedValues: "MANUAL,DYNAMIC,AI_GENERATED,SUPPLIER,MIXED,SEMBARK,TRIPJACK", notes: "Defaults to MANUAL", example: "MANUAL" },
];

export function cell(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") return row[key];
    const lower = key.toLowerCase();
    for (const [k, v] of Object.entries(row)) {
      if (k.toLowerCase() === lower && v !== undefined && v !== null && v !== "") return v;
    }
  }
  return undefined;
}

export function asString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  return s.length ? s : undefined;
}

export function asNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function asBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  const s = String(value).trim().toLowerCase();
  if (["true", "yes", "1"].includes(s)) return true;
  if (["false", "no", "0"].includes(s)) return false;
  return undefined;
}
