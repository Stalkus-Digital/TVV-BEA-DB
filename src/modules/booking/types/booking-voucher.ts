import type { SupplierBookingReference } from "./supplier-reference";

export interface BookingVoucherLineItem {
  title: string;
  description: string | null;
  quantity: number;
}

export interface BookingVoucherValidity {
  validFrom: string;
  validTo: string;
}

/** A data model only — no PDF library yet, per this sprint's explicit instruction. Persisted (repeated generation creates new numbered records) so a booking's voucher history survives. */
export interface BookingVoucher {
  id: string;
  bookingId: string;
  voucherNumber: string;
  issuedAt: string;
  leadTravellerName: string;
  destinationName: string;
  validity: BookingVoucherValidity | null;
  items: BookingVoucherLineItem[];
  supplierReferences: SupplierBookingReference[];
  notes: string | null;
  createdAt: string;
}
