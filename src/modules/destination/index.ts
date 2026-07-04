/**
 * Public surface of the Destination bounded context — same discipline as
 * Inventory/Supplier: repositories and service classes stay internal,
 * only types, API handlers, and service accessor functions are exported.
 */
export * from "./types";
export * from "./api";
export { getDestinationCategoryService, getDestinationService, getGeographyService } from "./module";
