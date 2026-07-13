export const adminEndpoints = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    me: "/api/auth/me",
  },
  users: "/api/users",
  customers: "/api/admin/customers",
  enquiries: "/api/admin/leads",
  enquiriesInbox: "/api/admin/enquiries",
  quotes: "/api/quotes",
  bookings: "/api/bookings",
  packages: "/api/packages",
  inventory: "/api/inventory",
  destinations: "/api/destinations",
  systemHealth: "/api/system/health",
  dashboardMetrics: "/api/admin/dashboard/metrics",
  storage: {
    upload: "/api/storage/upload",
  },
} as const;
