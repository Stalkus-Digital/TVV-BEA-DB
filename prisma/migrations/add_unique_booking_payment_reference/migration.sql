-- SECURITY-002D: Add unique constraint on BookingPayment.reference to prevent
-- duplicate payment records from concurrent requests. The application already
-- checks for duplicate references, but without a unique constraint, two concurrent
-- requests can race past the findFirst check and both call create(), creating
-- two records for the same Razorpay payment. The constraint makes this impossible.

ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_reference_key" UNIQUE ("reference");
