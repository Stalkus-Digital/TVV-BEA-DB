-- PP-002C-5: document verification status for passenger documents
ALTER TABLE "passenger_documents" ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING';
