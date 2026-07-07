export const BOOKINGS_ROUTE_PREFIX = "/dashboard/bookings";

export function bookingDetailPath(kind: string, id: string): string {
  return `${BOOKINGS_ROUTE_PREFIX}/${encodeURIComponent(kind)}/${encodeURIComponent(id)}`;
}

export function bookingsListPath(): string {
  return BOOKINGS_ROUTE_PREFIX;
}
