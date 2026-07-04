export const VisaType = {
  TOURIST: "TOURIST",
  BUSINESS: "BUSINESS",
  TRANSIT: "TRANSIT",
} as const;

export type VisaType = (typeof VisaType)[keyof typeof VisaType];

export const VisaEntryType = {
  SINGLE: "SINGLE",
  MULTIPLE: "MULTIPLE",
} as const;

export type VisaEntryType = (typeof VisaEntryType)[keyof typeof VisaEntryType];

export interface VisaDetails {
  countryId: string;
  visaType: VisaType;
  entryType: VisaEntryType;
  processingDays: number;
  validityDays: number;
  requiredDocuments: string[];
}
