import { searchWebsitePackagesHandler } from "@/modules/website";

/** Thin pass-through to the Website module's search handler — no query logic here. */
export function fetchSearchResults(query: unknown) {
  return searchWebsitePackagesHandler(query);
}
