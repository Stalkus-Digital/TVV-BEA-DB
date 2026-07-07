"use client";

import { useAuth } from "@/features/auth";
import { useBookingsQuery } from "@/features/bookings";
import { useQuotesQuery } from "@/features/quotes";
import { dashboardPaths } from "../paths";
import { useWishlistQuery } from "../hooks/useWishlistMutations";
import { DashboardShell } from "./DashboardShell";
import { DashboardStatCard } from "./DashboardStatCard";

export function DashboardOverviewPage() {
  const { user } = useAuth();
  const bookings = useBookingsQuery();
  const quotes = useQuotesQuery();
  // No `/api/me/wishlist` backend endpoint exists yet (see docs/37_PLATFORM_INTEGRATION_AUDIT.md);
  // disabled here to avoid firing a guaranteed-to-fail request on every dashboard visit.
  const wishlist = useWishlistQuery({ enabled: false });

  const bookingCount = bookings.data?.counts.total;
  const quoteCount = quotes.data?.length;
  const wishlistCount = wishlist.data?.length;

  return (
    <DashboardShell>
      <h1 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight tracking-tight text-ink">
        Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
        Manage your bookings, saved trips, and account details from here.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <DashboardStatCard
          eyebrow="Trips"
          title="My bookings"
          description="Upcoming and past holidays, flights, ferries."
          href={dashboardPaths.bookings}
          value={bookings.isLoading ? "…" : (bookingCount ?? 0)}
        />
        <DashboardStatCard
          eyebrow="Requests"
          title="My quotes"
          description="Custom itinerary proposals from your specialist."
          href={dashboardPaths.quotes}
          value={quotes.isLoading ? "…" : (quoteCount ?? 0)}
        />
        <DashboardStatCard
          eyebrow="Saved"
          title="Wishlist"
          description="Packages you have saved for later."
          href={dashboardPaths.wishlist}
          value={wishlist.isLoading ? "…" : (wishlistCount ?? 0)}
        />
        <DashboardStatCard
          eyebrow="Profile"
          title={user?.email ?? "Account"}
          description={user?.phone ?? "Update your contact details"}
          href={dashboardPaths.profile}
        />
      </div>
    </DashboardShell>
  );
}
