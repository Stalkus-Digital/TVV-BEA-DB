import { QueryClient, isServer } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export const adminQueryKeys = {
  session: ["admin", "session"] as const,
  dashboard: {
    kpis: ["admin", "dashboard", "kpis"] as const,
    health: ["admin", "dashboard", "health"] as const,
    activity: ["admin", "dashboard", "activity"] as const,
    revenueChart: ["admin", "dashboard", "revenue-chart"] as const,
  },
  enquiries: {
    list: (filters: Record<string, unknown>) => ["admin", "enquiries", "list", filters] as const,
    all: (filters: Record<string, unknown>) => ["admin", "enquiries", "all", filters] as const,
    detail: (id: string) => ["admin", "enquiries", "detail", id] as const,
    notes: (id: string) => ["admin", "enquiries", "notes", id] as const,
  },
  staff: {
    users: ["admin", "staff", "users"] as const,
  },
  customers: {
    list: (filters: Record<string, unknown>) => ["admin", "customers", "list", filters] as const,
    allUsers: ["admin", "customers", "all-users"] as const,
    relationshipData: ["admin", "customers", "relationship-data"] as const,
    detail: (id: string) => ["admin", "customers", "detail", id] as const,
  },
  quotes: {
    list: (filters: Record<string, unknown>) => ["admin", "quotes", "list", filters] as const,
    all: (filters: Record<string, unknown>) => ["admin", "quotes", "all", filters] as const,
    detail: (id: string) => ["admin", "quotes", "detail", id] as const,
    items: (id: string) => ["admin", "quotes", "items", id] as const,
    pricing: (id: string) => ["admin", "quotes", "pricing", id] as const,
    versions: (id: string) => ["admin", "quotes", "versions", id] as const,
  },
  destinations: {
    list: (filters: Record<string, unknown>) => ["admin", "destinations", "list", filters] as const,
    all: ["admin", "destinations", "all"] as const,
    detail: (id: string) => ["admin", "destinations", "detail", id] as const,
    breadcrumbs: (id: string) => ["admin", "destinations", "breadcrumbs", id] as const,
    children: (id: string) => ["admin", "destinations", "children", id] as const,
    nearby: (id: string) => ["admin", "destinations", "nearby", id] as const,
    categories: ["admin", "destinations", "categories"] as const,
    geography: {
      countries: ["admin", "destinations", "geography", "countries"] as const,
      states: (countryId?: string) => ["admin", "destinations", "geography", "states", countryId ?? ""] as const,
      regions: ["admin", "destinations", "geography", "regions"] as const,
      cities: (filter: Record<string, unknown>) => ["admin", "destinations", "geography", "cities", filter] as const,
    },
  },
  bookings: {
    list: (filters: Record<string, unknown>) => ["admin", "bookings", "list", filters] as const,
    all: (filters: Record<string, unknown>) => ["admin", "bookings", "all", filters] as const,
    detail: (id: string) => ["admin", "bookings", "detail", id] as const,
    travellers: (id: string) => ["admin", "bookings", "travellers", id] as const,
    payments: (id: string) => ["admin", "bookings", "payments", id] as const,
    documents: (id: string) => ["admin", "bookings", "documents", id] as const,
    notes: (id: string) => ["admin", "bookings", "notes", id] as const,
    timeline: (id: string) => ["admin", "bookings", "timeline", id] as const,
    statusHistory: (id: string) => ["admin", "bookings", "status-history", id] as const,
  },
  packages: {
    list: (filters: Record<string, unknown>) => ["admin", "packages", "list", filters] as const,
    all: (filters: Record<string, unknown>) => ["admin", "packages", "all", filters] as const,
    detail: (id: string) => ["admin", "packages", "detail", id] as const,
    preview: (id: string) => ["admin", "packages", "preview", id] as const,
    pricing: (id: string) => ["admin", "packages", "pricing", id] as const,
    compute: (id: string, params: Record<string, unknown>) => ["admin", "packages", "compute", id, params] as const,
    rules: (id: string) => ["admin", "packages", "rules", id] as const,
    availability: (id: string) => ["admin", "packages", "availability", id] as const,
    days: (id: string) => ["admin", "packages", "days", id] as const,
    versions: (id: string) => ["admin", "packages", "versions", id] as const,
  },
  inventory: {
    list: (filters: Record<string, unknown>) => ["admin", "inventory", "list", filters] as const,
    all: (filters: Record<string, unknown>) => ["admin", "inventory", "all", filters] as const,
    detail: (id: string) => ["admin", "inventory", "detail", id] as const,
    suppliers: ["admin", "inventory", "suppliers"] as const,
    supplierHealth: (code: string) => ["admin", "inventory", "supplier-health", code] as const,
  },
  cms: {
    home: ["admin", "cms", "home"] as const,
    navigation: ["admin", "cms", "navigation"] as const,
    featuredDestinations: ["admin", "cms", "featured-destinations"] as const,
    destinations: ["admin", "cms", "destinations"] as const,
    packages: ["admin", "cms", "packages"] as const,
    uploads: ["admin", "cms", "uploads"] as const,
  },
  operations: {
    health: ["admin", "operations", "health"] as const,
    modules: ["admin", "operations", "modules"] as const,
    metrics: ["admin", "operations", "metrics"] as const,
    performance: ["admin", "operations", "performance"] as const,
    version: ["admin", "operations", "version"] as const,
    logs: (filters: Record<string, unknown>) => ["admin", "operations", "logs", filters] as const,
    storageUploads: ["admin", "operations", "storage-uploads"] as const,
    supplierRuntime: {
      health: ["admin", "operations", "supplier-runtime", "health"] as const,
      metrics: ["admin", "operations", "supplier-runtime", "metrics"] as const,
      events: (limit: number) => ["admin", "operations", "supplier-runtime", "events", limit] as const,
      circuitBreakers: ["admin", "operations", "supplier-runtime", "circuit-breakers"] as const,
    },
  },
  marketing: {
    dashboard: ["admin", "marketing", "dashboard"] as const,
    forms: ["admin", "marketing", "forms"] as const,
    seo: ["admin", "marketing", "seo"] as const,
    landingPages: ["admin", "marketing", "landing-pages"] as const,
    content: ["admin", "marketing", "content"] as const,
    websiteHome: ["admin", "marketing", "website-home"] as const,
    websiteNavigation: ["admin", "marketing", "website-navigation"] as const,
  },
};
