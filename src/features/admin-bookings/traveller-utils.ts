import type { Traveller } from "./types";
import { TravellerType } from "./constants";

export function assessTravellerCompleteness(traveller: Traveller): { complete: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!traveller.fullName?.trim()) missing.push("fullName");
  if (!traveller.type) missing.push("type");
  if (!traveller.nationality?.trim()) missing.push("nationality");
  if (
    (traveller.type === TravellerType.CHILD || traveller.type === TravellerType.INFANT) &&
    !traveller.dateOfBirth
  ) {
    missing.push("dateOfBirth");
  }
  if (traveller.isLeadTraveller && !traveller.email?.trim() && !traveller.phone?.trim()) {
    missing.push("emailOrPhone");
  }
  return { complete: missing.length === 0, missing };
}

export function missingDocumentWarnings(
  travellers: Traveller[],
  documents: { travellerId: string | null; kind: string; expiresAt?: string | null; fileName?: string | null; isExpired?: boolean }[]
): string[] {
  const warnings: string[] = [];
  for (const traveller of travellers) {
    const docs = documents.filter((d) => d.travellerId === traveller.id);
    if (!docs.some((d) => d.kind === "PASSPORT")) {
      warnings.push(`Missing passport record for ${traveller.fullName}`);
    }
    if (traveller.visaRequired && !docs.some((d) => d.kind === "VISA")) {
      warnings.push(`Missing visa record for ${traveller.fullName} (visa required)`);
    }
  }
  for (const doc of documents) {
    if (doc.isExpired) {
      warnings.push(`${doc.kind} document expired${doc.fileName ? ` (${doc.fileName})` : ""}`);
    }
  }
  return warnings;
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
