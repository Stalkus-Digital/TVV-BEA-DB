-- PP-002C-1 Booking Foundation: index for quote→booking link lookups

CREATE INDEX IF NOT EXISTS "quotes_convertedBookingId_idx" ON "quotes"("convertedBookingId");
