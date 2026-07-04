/**
 * Travel OS API configuration — single backend, no legacy `/v1/*` paths.
 *
 * Public reads:     GET /api/website/*
 * Customer auth:    POST/GET /api/auth/*
 * Customer bookings: GET /api/me/bookings/*  (read-only — no self-service cancellation exists)
 * Customer quotes:   /api/me/quotes/*
 * Lead capture:      POST /api/enquiries  (public, the site-wide "enquiry" form's real target)
 * Customer profile:  GET/PATCH /api/me/profile
 *
 * Hierarchy navigation (`/api/navigation/tree`) is served by this Next.js
 * app's Postgres BFF — not Travel OS — until geography fully migrates.
 *
 * See docs/38_CUSTOMER_INTEGRATION.md and docs/TODO_BACKEND_REQUIRED.md.
 */

/**
 * IMPORTANT:
 * Next.js only inlines `NEXT_PUBLIC_*` env vars into client bundles when they
 * are accessed via direct property reads (e.g. `process.env.NEXT_PUBLIC_FOO`).
 * Dynamic lookups like `process.env[key]` will be `undefined` in the browser.
 */

export const apiConfig = {
  /** Travel OS base URL — include scheme/host only; paths start with `/api/...`. */
  baseUrl:
    process.env.NEXT_PUBLIC_TRAVEL_OS_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:3000",
  timeoutMs: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? "12000"),
  retries: Number(process.env.NEXT_PUBLIC_API_RETRIES ?? "1"),
  /**
   * When true, domain services read from `lib/mock` instead of HTTP.
   * Defaults to false — set `NEXT_PUBLIC_USE_MOCK=true` locally for offline UI work.
   */
  useMock: (process.env.NEXT_PUBLIC_USE_MOCK ?? "false") === "true",
} as const;

/**
 * Typed Travel OS path builders — prefer these in new code.
 *
 * `bookings`/`quotes` were pointed at the *admin* paths (`/api/bookings`,
 * `/api/quotes`) until Phase 1 Customer Integration — those are RBAC-gated
 * for staff, have no row-ownership filter, and a customer's own JWT has no
 * grant for them at all (confirmed live: a CUSTOMER-role token gets a real
 * 403 from `/api/bookings`). The correct, row-scoped, customer-facing
 * endpoints have existed since the Customer Experience Platform sprint:
 * `/api/me/quotes` and `/api/me/bookings`. See docs/38_CUSTOMER_INTEGRATION.md.
 */
export const travelOs = {
  website: {
    home: "/api/website/home",
    navigation: "/api/website/navigation",
    packages: "/api/website/packages",
    package: (slug: string) => `/api/website/package/${encodeURIComponent(slug)}`,
    destinations: "/api/website/destinations",
    destination: (slug: string) => `/api/website/destination/${encodeURIComponent(slug)}`,
    search: "/api/website/search",
  },
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    me: "/api/auth/me",
    changePassword: "/api/auth/change-password",
    requestPasswordReset: "/api/auth/request-password-reset",
    resetPassword: "/api/auth/reset-password",
  },
  /** Row-scoped to the authenticated customer — never another customer's data. */
  bookings: {
    list: "/api/me/bookings",
    detail: (id: string) => `/api/me/bookings/${encodeURIComponent(id)}`,
  },
  /** Row-scoped to the authenticated customer. `submit` (`POST /api/me/quotes`) requires
   * login and a real `packageSlug` — nothing in the UI calls it yet (the
   * site-wide "enquiry" form maps to `enquiries.submit` below instead, not
   * this). Kept here, correctly wired, for a future "Request a quote for
   * this package" action. */
  quotes: {
    list: "/api/me/quotes",
    detail: (id: string) => `/api/me/quotes/${encodeURIComponent(id)}`,
    submit: "/api/me/quotes",
  },
  /** Public, anonymous-friendly lead capture — works with or without a session (see src/app/api/enquiries/route.ts). This IS the site-wide contact/enquiry form's real target. */
  enquiries: {
    submit: "/api/enquiries",
  },
  /** The full self-service profile (name, phone, DOB, passport, emergency contact, preferences) — distinct from `auth.me`, which only returns identity/roles. */
  profile: {
    get: "/api/me/profile",
    update: "/api/me/profile",
  },
} as const;

/**
 * Legacy-shaped endpoint map consumed by existing `lib/api/*.ts` modules.
 * Aliases `travelOs` paths — no fake `/unsupported/*` URLs.
 */
export const endpoints = {
  packages: {
    list: travelOs.website.packages,
    detail: travelOs.website.package,
  },
  destinations: {
    list: travelOs.website.destinations,
    detail: travelOs.website.destination,
  },
  search: {
    universal: travelOs.website.search,
  },
  homepage: {
    home: travelOs.website.home,
  },
  auth: {
    login: travelOs.auth.login,
    register: travelOs.auth.register,
    logout: travelOs.auth.logout,
    refresh: travelOs.auth.refresh,
    me: travelOs.auth.me,
    updateMe: travelOs.auth.me,
    forgotPassword: travelOs.auth.requestPasswordReset,
    resetPassword: travelOs.auth.resetPassword,
    changePassword: travelOs.auth.changePassword,
  },
  /** Local Postgres hierarchy BFF — not Travel OS. */
  navigation: {
    tree: "/api/navigation/tree",
  },
  myBookings: {
    list: travelOs.bookings.list,
    detail: (_kind: string, id: string) => travelOs.bookings.detail(id),
  },
  /** `submit` intentionally points at the public enquiry endpoint, not `travelOs.quotes.submit` — see travelOs.quotes's own docstring above for why. */
  quotes: {
    submit: travelOs.enquiries.submit,
    list: travelOs.quotes.list,
    detail: travelOs.quotes.detail,
  },
  enquiries: {
    submit: travelOs.enquiries.submit,
  },
  profile: {
    get: travelOs.profile.get,
    update: travelOs.profile.update,
  },
} as const;
