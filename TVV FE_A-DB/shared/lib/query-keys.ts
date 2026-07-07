export const queryKeys = {
  packages: {
    all: ["packages"] as const,
    list: (params: Record<string, unknown>) => ["packages", "list", params] as const,
    detail: (slug: string) => ["packages", "detail", slug] as const,
  },
  destinations: {
    tree: ["destinations", "tree"] as const,
    detail: (slug: string) => ["destinations", "detail", slug] as const,
  },
  customer: {
    me: ["customer", "me"] as const,
    wishlist: ["customer", "wishlist"] as const,
  },
  bookings: {
    list: (pagination: { page: number }) => ["bookings", "list", pagination] as const,
    detail: (kind: string, id: string) => ["bookings", "detail", kind, id] as const,
  },
  quotes: {
    all: ["quotes"] as const,
    detail: (id: string) => ["quotes", "detail", id] as const,
  },
  search: {
    results: (q: string, filters: Record<string, unknown>) =>
      ["search", "results", q, filters] as const,
  },
} as const;
