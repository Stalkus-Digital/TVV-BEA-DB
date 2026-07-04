import { searchLegacy, type LegacySearchQuery } from "../services/legacy-search.service";

export function searchLegacyHandler(query: LegacySearchQuery) {
  return searchLegacy(query);
}
