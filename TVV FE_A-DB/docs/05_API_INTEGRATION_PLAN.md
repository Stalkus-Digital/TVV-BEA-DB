# 05. API Integration Plan

This document outlines the design and integration of the dedicated API Layer under `lib/api/` and its relationship with the orchestrating services and TanStack Query.

---

## 1. Directory Blueprint (`lib/api/`)

Every network request is isolated from components. Page layout and features never trigger `fetch` or call endpoint paths directly. They interact with these dedicated modules:

*   **`packages.ts`**: Fetches manual and TripJack (vendor) travel packages, handles package detail, related package retrieval, and package filter operations.
*   **`destinations.ts`**: Handles public read operations for regions, countries, and specific destinations. Fetches hierarchical trees for the main navigation menus.
*   **`search.ts`**: Connects to the universal search API, bringing live matching categories, guides, and package items.
*   **`quotes.ts`**: Standardizes itinerary request submissions, quote tracking, and quote lists for dashboards.
*   **`bookings.ts`**: Handles user bookings details, booking list pagination, and cancellation requests.
*   **`auth.ts`**: Handles JWT exchange (login, registration, forgot-password) and session validation.
*   **`website.ts`**: Retrieves homepage slider configs, site settings, dynamic pages (Privacy, Terms), and custom static layout variables.
*   **`users.ts`**: Updates customer profile coordinates and passwords.

---

## 2. API Method Contracts & Typing

All API methods consume the custom `apiClient` singleton (`lib/api/client.ts`) and return standard TypeScript models.

```typescript
// Example: lib/api/packages.ts
import { apiClient } from "./client";
import { endpoints } from "./config";
import type { Package } from "@/lib/models";

export async function fetchPackageBySlug(slug: string): Promise<Package | null> {
  // isolated call using endpoints schema
  return apiClient.get<Package>(endpoints.packages.detail(slug), {
    treat404AsNull: true,
  });
}
```

---

## 3. The Services Layer Orchestration

While `lib/api/` handles standard HTTP queries, `lib/services/` acts as the domain manager:
1.  **Mock Switch:** Services intercept calls when `apiConfig.useMock` is active, returning mock data from `lib/mock/` instead of triggering HTTP queries.
2.  **Adapters:** Services run adapter filters (e.g. normalizing differences between manual packages and TripJack vendor APIs) before sending them to the UI.
3.  **Data Hydration:** Combines PostgreSQL queries (hierarchy database) and API service calls for hybrid queries.

```
[Component] ──(Query Hook)──> [Service] ──> [useMock?] 
                                              ├── Yes ──> [lib/mock/*]
                                              └── No  ──> [lib/api/*] ──> [Network]
```

---

## 4. Response & Error Standard

All API requests pass through `apiClient` which enforces:
*   **Response Unwrapping:** Intercepts `{ success, data }` envelopes. If `success === false`, it raises an `ApiError` containing error details.
*   **Timeout & Retries:** Built-in network abort controllers (`timeoutMs: 12000`) and linear delay retry attempts.
*   **JWT Integration:** Automatically injects the active Bearer token into request headers, retrieved from cookie or LocalStorage.
