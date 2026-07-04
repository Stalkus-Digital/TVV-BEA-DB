/**
 * Decides whether the global Navbar should render in `solid` mode
 * (cream background, dark text) or default `transparent` mode (over a dark hero).
 *
 * The navbar is `fixed inset-x-0 top-0` with white text by default. That works
 * as long as the area immediately behind it is dark — either a full
 * `<HeroSection>`+`<HeroBackground>` (image + navy gradient), or a plain
 * `<HeroSection>` (navy bg without an image), or a manual `bg-navy` strip.
 *
 * `solid` mode is reserved for pages that render on cream/white from pixel 0
 * (auth + account routes). Everything else gets the transparent navbar.
 *
 * Single source of truth — used by both `<Navbar>` and `<AccountLink>` so they
 * never disagree on the variant.
 */
export function isSolidNavRoute(pathname: string): boolean {
  // Auth + customer-account routes — these render `<AuthLayout>` / `<AccountShell>`
  // directly on cream with no navy backdrop at all.
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/my-bookings" ||
    pathname.startsWith("/my-bookings/")
  );
}
