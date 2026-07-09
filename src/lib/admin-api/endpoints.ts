export const adminEndpoints = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    me: "/api/auth/me",
  },
  users: "/api/users",
  enquiries: "/api/admin/leads",
  quotes: "/api/quotes",
  bookings: "/api/bookings",
  packages: "/api/packages",
  inventory: "/api/inventory",
  destinations: "/api/destinations",
  systemHealth: "/api/system/health",
  dashboardMetrics: "/api/admin/dashboard/metrics",
} as const;
