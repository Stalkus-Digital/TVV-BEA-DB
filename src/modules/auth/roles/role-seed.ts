import { RoleName } from "../types/role";

/** The 12 roles named in this sprint's brief, seeded once at module registration (roles/role.service.ts's ensureSeeded()). System roles — not admin-creatable/deletable this sprint. */
export const ROLE_SEED_DATA: { name: RoleName; description: string }[] = [
  { name: RoleName.SUPER_ADMIN, description: "Full system access, including user, role, and settings administration." },
  { name: RoleName.ADMIN, description: "Full access to every business module; cannot restructure roles/permissions or delete settings." },
  { name: RoleName.SALES, description: "Creates and manages Quotes; converts approved Quotes into Bookings; read access to the catalog." },
  { name: RoleName.RESERVATIONS, description: "Manages Bookings end-to-end (confirm, travellers, documents, ticketing)." },
  { name: RoleName.OPERATIONS, description: "Manages the catalog: Inventory, Destinations, Packages; fulfils Bookings operationally." },
  { name: RoleName.FINANCE, description: "Manages Booking payments and invoices; read access to Quotes and Packages for pricing context." },
  { name: RoleName.SUPPORT, description: "Read access to Quotes, Bookings, and Users for customer support purposes." },
  { name: RoleName.MARKETING, description: "Manages public Website content and SEO; read access to the catalog." },
  { name: RoleName.SUPPLIER, description: "External partner — read-only visibility into their own Inventory and related Bookings." },
  { name: RoleName.AGENT, description: "External travel agent partner — creates Quotes on behalf of customers, read access to the catalog." },
  { name: RoleName.CUSTOMER, description: "Self-service read access to their own Quotes and Bookings." },
  { name: RoleName.API, description: "Machine-to-machine access via an API key; default grant is read-only across business resources." },
];
