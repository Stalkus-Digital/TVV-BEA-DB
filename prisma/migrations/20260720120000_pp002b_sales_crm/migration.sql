-- PP-002B Sales CRM: follow-up date, priority on enquiries, customer notes

ALTER TABLE "enquiries" ADD COLUMN IF NOT EXISTS "followUpDate" TIMESTAMP(3);
ALTER TABLE "enquiries" ADD COLUMN IF NOT EXISTS "priority" TEXT;

CREATE INDEX IF NOT EXISTS "enquiries_followUpDate_idx" ON "enquiries"("followUpDate");

CREATE TABLE IF NOT EXISTS "customer_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "customer_notes_userId_idx" ON "customer_notes"("userId");
