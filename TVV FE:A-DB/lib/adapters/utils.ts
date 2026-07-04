import { slugify } from "@/lib/utils";

/** Stable slug for vendor packages — keeps URLs predictable even if vendor IDs rotate. */
export function vendorSlug(vendorCode: string, name: string): string {
  return slugify(`${name}-${vendorCode.slice(-6)}`);
}

/** Map vendor country code → TVV region. Conservative defaults. */
export function regionFor(countryCode?: string): "domestic" | "international" | "andaman" {
  if (!countryCode) return "international";
  if (countryCode === "IN") return "domestic";
  return "international";
}

/** Normalise vendor-supplied themes/tags into a single deduped list. */
export function unifyThemes(...sources: (string[] | undefined)[]): string[] {
  const set = new Set<string>();
  for (const list of sources) (list ?? []).forEach((s) => set.add(s.toLowerCase()));
  return [...set];
}
