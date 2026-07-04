/**
 * Public surface of the Supplier Engine. Business modules — and other
 * modules generally — must never import an adapter directly: TripJackAdapter,
 * FerryAdapter, and ManualSupplierAdapter are NOT exported here, only
 * reachable from module.ts's own composition root. Only the registry
 * accessor, the service accessor, and the types needed to work with either
 * are public.
 */
export * from "./types";
export * from "./api";
export { getSupplierRegistry, getSupplierService } from "./module";
