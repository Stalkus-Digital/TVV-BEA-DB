-- AlterTable
ALTER TABLE "enquiries" ADD COLUMN     "assignedToUserId" TEXT;

-- CreateTable
CREATE TABLE "enquiry_notes" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enquiry_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "enquiry_notes_enquiryId_idx" ON "enquiry_notes"("enquiryId");

-- CreateIndex
CREATE INDEX "enquiries_assignedToUserId_idx" ON "enquiries"("assignedToUserId");
