/**
 * Public surface of the Storage module — same discipline as every other
 * module: `StorageService`/`StorageProvider` implementations stay
 * internal, only types, API handlers, and service accessor functions are
 * exported.
 */
export * from "./types";
export * from "./api";
export { getStorageService, getSignedUrlService } from "./module";
