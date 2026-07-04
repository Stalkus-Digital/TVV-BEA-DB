/** Granular CRUD per the 9 resources named in this sprint's brief. WEBSITE is included per the literal brief even though /api/website/* itself stays unauthenticated (see middleware/route-permission-map.ts) — reserved for a future admin-side website-content-management surface, same "reserved but inert" pattern as Package.aiGeneratedFromId. */
export const PermissionResource = {
  INVENTORY: "INVENTORY",
  DESTINATION: "DESTINATION",
  PACKAGE: "PACKAGE",
  WEBSITE: "WEBSITE",
  QUOTE: "QUOTE",
  BOOKING: "BOOKING",
  USERS: "USERS",
  ROLES: "ROLES",
  SETTINGS: "SETTINGS",
} as const;

export type PermissionResource = (typeof PermissionResource)[keyof typeof PermissionResource];

export const PermissionAction = {
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const;

export type PermissionAction = (typeof PermissionAction)[keyof typeof PermissionAction];

/** key is the canonical "RESOURCE:ACTION" identifier (e.g. "INVENTORY:CREATE") — what role-permission checks actually compare against. */
export interface Permission {
  id: string;
  resource: PermissionResource;
  action: PermissionAction;
  key: string;
  description: string;
  createdAt: string;
}
