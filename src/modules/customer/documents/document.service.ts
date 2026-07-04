import { isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import { DocumentKind, getBookingService, getInvoiceService, getPassengerDocumentService, getVoucherService } from "@/modules/booking";

export type CustomerDocumentKind = "INVOICE" | "VOUCHER" | "TICKET" | "INSURANCE" | "PASSPORT" | "VISA";

/**
 * `documentUrl` is always `null` — no blob storage or signed-URL
 * generation exists yet (this sprint's explicit instruction: "Use signed
 * URLs where appropriate. Do not implement blob storage yet."). The field
 * stays on the shape because the frontend contract should be stable now;
 * same "reserved but inert" pattern as `PassengerDocument.fileUrl` itself.
 */
export interface CustomerDocumentSummary {
  kind: CustomerDocumentKind;
  id: string;
  bookingId: string;
  number: string | null;
  issuedAt: string | null;
  documentUrl: string | null;
}

export interface CustomerDocumentsResponse {
  invoices: CustomerDocumentSummary[];
  vouchers: CustomerDocumentSummary[];
  tickets: CustomerDocumentSummary[];
  insurance: CustomerDocumentSummary[];
  passportUploads: CustomerDocumentSummary[];
  visaUploads: CustomerDocumentSummary[];
}

const MAX_BOOKINGS_SCANNED = 100;

/**
 * Aggregates every document type across every booking the customer owns.
 * Ownership is enforced upstream (`getBookingService().list({customerId})`
 * only ever returns the caller's own bookings) — this service never takes
 * a bookingId directly from a request.
 */
export class CustomerDocumentService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async listForCustomer(customerId: string): Promise<Result<CustomerDocumentsResponse, AppError>> {
    const bookings = await getBookingService().list({ customerId, page: 1, pageSize: MAX_BOOKINGS_SCANNED });
    if (isErr(bookings)) return bookings;

    const response: CustomerDocumentsResponse = {
      invoices: [],
      vouchers: [],
      tickets: [],
      insurance: [],
      passportUploads: [],
      visaUploads: [],
    };

    for (const booking of bookings.value.items) {
      const [invoices, vouchers, documents] = await Promise.all([
        getInvoiceService().listByBooking(booking.id),
        getVoucherService().listByBooking(booking.id),
        getPassengerDocumentService().listByBooking(booking.id),
      ]);
      if (isErr(invoices)) return invoices;
      if (isErr(vouchers)) return vouchers;
      if (isErr(documents)) return documents;

      response.invoices.push(
        ...invoices.value.map((invoice) => ({
          kind: "INVOICE" as const,
          id: invoice.id,
          bookingId: booking.id,
          number: invoice.invoiceNumber,
          issuedAt: invoice.issuedAt,
          documentUrl: null,
        }))
      );
      response.vouchers.push(
        ...vouchers.value.map((voucher) => ({
          kind: "VOUCHER" as const,
          id: voucher.id,
          bookingId: booking.id,
          number: voucher.voucherNumber,
          issuedAt: voucher.issuedAt,
          documentUrl: null,
        }))
      );

      for (const document of documents.value) {
        const entry: CustomerDocumentSummary = {
          kind: document.kind as CustomerDocumentKind,
          id: document.id,
          bookingId: booking.id,
          number: document.fileName,
          issuedAt: document.issuedAt,
          documentUrl: document.fileUrl,
        };
        if (document.kind === DocumentKind.TICKET) response.tickets.push(entry);
        else if (document.kind === DocumentKind.INSURANCE) response.insurance.push(entry);
        else if (document.kind === DocumentKind.PASSPORT) response.passportUploads.push(entry);
        else if (document.kind === DocumentKind.VISA) response.visaUploads.push(entry);
      }
    }

    return ok(response);
  }
}
