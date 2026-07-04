/**
 * Public surface of the Inventory bounded context. Other modules and route
 * handlers may import from here (and only from here) — never reach into
 * ./services, ./repositories, or ./validation directly (per
 * docs/02_SYSTEM_ARCHITECTURE.md's "no shared business logic between
 * modules" rule and docs/CODING_CONVENTIONS.md §1).
 *
 * Exporting getInventoryService is intentional, not an encapsulation leak:
 * docs/02's Module Relationships section shows inter-module calls happening
 * at the Services layer ("Package Builder ↓ Inventory Service") — so this
 * is the sanctioned way another module calls into Inventory, distinct from
 * the HTTP API surface under src/app/api/inventory/*.
 */
export * from "./types";
export * from "./api";
export { getInventoryService } from "./module";
