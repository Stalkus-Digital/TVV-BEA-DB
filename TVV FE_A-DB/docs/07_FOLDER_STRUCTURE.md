# 07. Folder Structure & Code Organization

This document details the modular layout of **The Vacation Voice V2** workspace. It provides developers with guidelines on where files must live and the rules of dependency directions.

---

## 1. Directory Tree Map

```
/
├── app/                              # Route Handlers & Server Layouts
│   ├── (auth)/                       # Auth routing group (login, register)
│   ├── (dashboard)/                  # User dashboard space (bookings, profile)
│   ├── api/                          # Public and Admin next API routes
│   ├── destinations/                 # Catch-all destination listings and guides
│   ├── packages/                     # Package directory and package details
│   ├── sitemap.ts                    # Dynamic XML Sitemap generator
│   └── globals.css                   # Global styles & tailwind configurations
│
├── features/                         # Encapsulated Business Features
│   ├── destinations/                 # Destination-specific components & services
│   ├── packages/                     # Itineraries, galleries, and package details
│   ├── search/                       # Universal Live Search panels & sorting filters
│   ├── quotes/                       # Quote builder forms & dashboards
│   ├── bookings/                     # Booking statuses, details, and PDF documents
│   └── dashboard/                    # Wishlist panels, dashboard tabs, notifications
│
├── shared/                           # Reusable logic, components, types
│   ├── components/                   # UI Primitives, Skeletons, Page-wide components
│   ├── hooks/                        # Generic utility hooks (outside clicks, SWR)
│   ├── services/                     # Connects frontend views to backend APIs
│   ├── lib/                          # DB Singletons, API client configurations
│   └── types/                        # Core TypeScript shapes and interfaces
│
├── prisma-hierarchy/                 # Postgres Schema & Seeding Logic
│   ├── schema.prisma                 # Geographic Tree Model configurations
│   └── seed.ts                       # Seeding scripts for Region/Country nodes
│
├── public/                           # Static assets, fonts, icons, placeholders
└── docs/                             # Architecture & developer specifications
```

---

## 2. Directory Layout within a Feature

Every feature folder in `features/` must adhere to a standardized layout to keep imports uniform.

```
features/packages/
  ├── components/          # Feature-specific sub-components (e.g. ItineraryAccordion)
  ├── hooks/               # Hooks specific to this flow (e.g. usePackageFilters)
  ├── services/            # Custom logic hooks (e.g. packages.service.ts wrapper)
  ├── types.ts             # Domain-specific type annotations
  └── index.ts             # Barrel file (public API of the feature)
```

---

## 3. Boundary Rules & Import Restrictions

*   **No Circular Dependencies:** Features must not import from each other in loops. If `features/packages` imports from `features/destinations`, then `features/destinations` cannot import from `features/packages` directly. Use `shared/` to host shared logic.
*   **Encapsulation:** Sub-components inside `features/packages/components/` must not be imported directly by components in `features/auth`. The other features must import only what is exposed via `features/packages/index.ts`.
*   **Prisma Client Restrictions:** Only code in `lib/hierarchy/` is allowed to query the hierarchy DB client directly. Components and features must call service layer functions.
