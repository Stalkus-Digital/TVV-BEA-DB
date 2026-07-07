# 06. Route & Data Migration Plan

This document details the transition strategy for moving from the legacy MongoDB-backed location system to the Postgres-backed multi-level Geographical Hierarchy system.

---

## 1. Context: Dual-Database Coexistence

To ensure zero downtime, the application coexists with two databases:
*   **Legacy Database (MongoDB):** Stores packages, site settings, reviews, user profiles, and bookings.
*   **Geographical Hierarchy (PostgreSQL):** Holds the recursive region-to-leaf tree nodes.

```
LEGACY URL: /destinations/[slug] (MongoDB Location Table)
MIGRATED URL: /destinations/[...slugs] (Postgres Destinations Table)
```

---

## 2. Phase-by-Phase Execution Plan

### Phase 1: Database Setup & Seed
*   Deploy PostgreSQL instance and migrate the hierarchy schema (`prisma-hierarchy/schema.prisma`).
*   Verify triggers and unique constraints for automatic path calculation and prefix cascades.
*   Run the seed scripts (`npm run hierarchy:seed`) to create top-level regions, countries, and major islands (Andaman).

### Phase 2: ETL (Extract, Transform, Load) Location Data
*   Execute a custom migration script:
    1.  Walk existing MongoDB `Location` nodes.
    2.  Map each node to its Postgres hierarchy level (`REGION`, `COUNTRY`, `DESTINATION`, `SUB_DESTINATION`).
    3.  Insert nodes with appropriate parent IDs.
    4.  Verify that triggers calculate correct slug paths (e.g., `asia-pacific/india/andaman`).

### Phase 3: Application-Level FK Integration
Since the databases are separate, we cannot rely on native database FK constraints.
*   Add a string `destinationId` field to MongoDB `HolidayPackage` and `Hotel` schemas.
*   Modify admin UI to load the tree structure via `/api/v2/destinations/tree`, saving the selected Postgres leaf node ID on packages.
*   Update frontend listing resolvers to query:
    1.  Resolve current slug path to Postgres destination ID (plus children IDs).
    2.  Fetch packages from MongoDB where `destinationId` matches resolved ID list.

### Phase 4: Page Swap & Redirects
*   **Step 1:** Delete legacy dynamic route `app/destinations/[slug]/page.tsx`.
*   **Step 2:** Move dynamic catch-all route folder `app/destinations-v2/[...slugs]/` to `app/destinations/[...slugs]/`.
*   **Step 3:** Change `ROUTE_PREFIX` in `lib/hierarchy/breadcrumbs.ts` from `"/destinations-v2"` to `"/destinations"`.
*   **Step 4:** Deploy Middleware URL redirection:
    *   Intercept single segment paths (e.g., `/destinations/andaman`).
    *   Query redirect table or slug history table for resolved multi-segment path (`/destinations/asia-pacific/india/andaman`).
    *   Return HTTP 301 (Permanent Redirect) to preserve SEO signals.
*   **Step 5:** Update XML sitemap generator to query and map catch-all paths instead of legacy ones.
