/**
 * Public surface of the Customer module — same discipline as every other
 * module: repository and service classes stay internal, only types, API
 * handlers, and service accessor functions are exported.
 */
export * from "./types";
export * from "./api";
export {
  getCustomerProfileService,
  getCustomerQuoteService,
  getCustomerBookingService,
  getEnquiryService,
  getCustomerDocumentService,
  getDashboardService,
  getSembarkService,
} from "./module";
