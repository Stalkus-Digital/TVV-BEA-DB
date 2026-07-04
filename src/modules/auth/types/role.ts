/** The 12 roles named in this sprint's brief — system-seeded (see roles/role-seed.ts), not admin-creatable this sprint. */
export const RoleName = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  SALES: "SALES",
  RESERVATIONS: "RESERVATIONS",
  OPERATIONS: "OPERATIONS",
  FINANCE: "FINANCE",
  SUPPORT: "SUPPORT",
  MARKETING: "MARKETING",
  SUPPLIER: "SUPPLIER",
  AGENT: "AGENT",
  CUSTOMER: "CUSTOMER",
  API: "API",
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export interface Role {
  id: string;
  name: RoleName;
  description: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}
