export const DESTINATIONS_ROUTE_PREFIX = "/destinations";

export function destinationSlugPathHref(slugPath: string): string {
  return `${DESTINATIONS_ROUTE_PREFIX}/${slugPath}`;
}
