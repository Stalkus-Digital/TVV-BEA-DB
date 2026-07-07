export { DashboardShell } from "./components/DashboardShell";
export { DashboardOverviewPage } from "./components/DashboardOverviewPage";
export { BookingsListPage } from "./components/BookingsListPage";
export { QuotesListPage } from "./components/QuotesListPage";
export { WishlistPage } from "./components/WishlistPage";
export { ProfilePage } from "./components/ProfilePage";
export { DashboardStatCard } from "./components/DashboardStatCard";
export { PackageWishlistToggle } from "./components/PackageWishlistToggle";

export { dashboardFeatureService } from "./services/dashboard.feature.service";
export { useWishlistQuery, useWishlistMutations } from "./hooks/useWishlistMutations";
export { useUpdateProfileMutation, useChangePasswordMutation } from "./hooks/useProfileMutations";

export { dashboardPaths, DASHBOARD_ROUTE } from "./paths";

export {
  profileSchema,
  changePasswordSchema,
  type ProfileFormValues,
  type ChangePasswordFormValues,
} from "./schemas";

export type { DashboardOverviewStats } from "./types";

// Re-export domain features for convenience
export { useBookingsQuery, BookingCard, bookingDetailPath } from "@/features/bookings";
export { useQuotesQuery, QuoteCard } from "@/features/quotes";
