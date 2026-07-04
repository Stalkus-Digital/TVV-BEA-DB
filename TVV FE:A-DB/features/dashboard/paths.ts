import { bookingsListPath, bookingDetailPath } from "@/features/bookings";

export const DASHBOARD_ROUTE = "/dashboard";

export const dashboardPaths = {
  home: DASHBOARD_ROUTE,
  bookings: bookingsListPath(),
  quotes: `${DASHBOARD_ROUTE}/quotes`,
  wishlist: `${DASHBOARD_ROUTE}/wishlist`,
  profile: `${DASHBOARD_ROUTE}/profile`,
  bookingDetail: bookingDetailPath,
} as const;
