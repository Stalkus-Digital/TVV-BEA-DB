# 09. State Management Architecture

This document defines the state management boundaries of **The Vacation Voice V2**. It specifies how server state and client state are isolated and handled.

---

## 1. Core Rule: Zero Redux/Zustand Global State

We do not implement global state managers like Redux or Zustand. The application is built to run on:
1.  **Server State:** TanStack Query handles caching, network synchronization, and optimistic UI updates.
2.  **Local UI State:** Component-level `useState` and `useReducer`.
3.  **UI Contexts:** Thin React Contexts for Theme, Authentication Session, and Mobile Navigation state.

---

## 2. Server State with TanStack Query

We use `@tanstack/react-query` to manage all data fetched from backend APIs.

```
[Server Component] ──(Prefetch / Dehydrate)──> [HTML + Hydration Data]
                                                       │
                                                       ▼
[Client Component] ──(useQuery / Hydrate)──────> [Query Cache]
```

### Server-Side Prefetching & Hydration (SSR)
*   To avoid layout shifts and empty loading screens, dynamic pages prefetch data on the server.
*   We use the `@tanstack/react-query` Hydration API:
    1.  Instantiate a `QueryClient` inside the Server Page.
    2.  Prefetch data using `queryClient.prefetchQuery`.
    3.  Wrap Client child components with `<HydrationBoundary state={dehydrate(queryClient)}>`.
    4.  Client components invoke `useQuery` with matching query keys to retrieve data instantly from cache.

---

## 3. Query Key Conventions

Query keys are structured as arrays containing serialized filter parameters to ensure cache hits are deterministic:

| Domain | Key Structure | Example |
| :--- | :--- | :--- |
| **Packages List** | `['packages', 'list', queryParams]` | `['packages', 'list', { region: 'andaman' }]` |
| **Package Detail** | `['packages', 'detail', slug]` | `['packages', 'detail', 'havelock-escape']` |
| **Destinations Menu**| `['destinations', 'tree']` | `['destinations', 'tree']` |
| **Customer Profile**| `['customer', 'me']` | `['customer', 'me']` |
| **Bookings list** | `['bookings', 'list', pagination]` | `['bookings', 'list', { page: 1 }]` |

---

## 4. Cache Invalidation and Mutations

For write operations, we use `useMutation` and trigger target invalidations to update queries:
*   On submitting an itinerary inquiry form: mutate Quote record, then invalidate `['quotes']` queries.
*   On updating user details: mutate customer profile, then trigger a refresh on `['customer', 'me']`.
*   On adding a package to a board: optimistically update the state, then invalidate `['customer', 'wishlist']`.
