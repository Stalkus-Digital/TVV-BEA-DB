export interface BookingInvoiceLineItem {
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface BookingInvoiceBillTo {
  name: string;
  email: string;
  phone: string | null;
}

/** A data model only — no PDF-rendering library installed (same discipline as Quote's PDF data model). Persisted so a booking's invoice history survives repeated generation. */
export interface BookingInvoice {
  id: string;
  bookingId: string;
  invoiceNumber: string;
  issuedAt: string;
  billTo: BookingInvoiceBillTo;
  currency: string;
  lineItems: BookingInvoiceLineItem[];
  subtotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  createdAt: string;
}
