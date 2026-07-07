import { permanentRedirect } from "next/navigation";

/** Legacy `/account/bookings` redirects to `/dashboard/bookings`. */
export default function LegacyAccountBookingsRedirect() {
  permanentRedirect("/dashboard/bookings");
}
