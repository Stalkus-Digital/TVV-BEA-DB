/**
 * Public surface of the Quote Engine — same discipline as every other
 * module: repository and service classes stay internal, only types, API
 * handlers, and service accessor functions are exported.
 */
export * from "./types";
export * from "./api";
export { getQuoteItemService, getQuoteService, getQuoteVersionService } from "./module";
