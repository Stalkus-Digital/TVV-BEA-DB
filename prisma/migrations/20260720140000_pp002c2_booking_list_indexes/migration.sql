-- PP-002C-2 Booking CRUD & Admin UX: list filter indexes

CREATE INDEX IF NOT EXISTS "bookings_paymentStatus_idx" ON "bookings"("paymentStatus");
CREATE INDEX IF NOT EXISTS "bookings_createdAt_idx" ON "bookings"("createdAt");
