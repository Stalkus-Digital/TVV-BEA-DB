-- PP-002C-6: outbound booking email dispatch log (dedupe + status)
CREATE TABLE IF NOT EXISTS "email_dispatches" (
  "id" TEXT NOT NULL,
  "dedupeKey" TEXT NOT NULL,
  "bookingId" TEXT,
  "event" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "recipient" TEXT,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "email_dispatches_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "email_dispatches_dedupeKey_key" ON "email_dispatches"("dedupeKey");
CREATE INDEX IF NOT EXISTS "email_dispatches_bookingId_idx" ON "email_dispatches"("bookingId");

-- Drop unused multi-channel stub table if a prior draft migration created it
DROP TABLE IF EXISTS "notification_dispatches";
