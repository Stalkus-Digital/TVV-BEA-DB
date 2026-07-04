-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "destinationId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_records" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capabilities" TEXT[],
    "status" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isoCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "stateId" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airports" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "iataCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destination_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "stateId" TEXT,
    "cityId" TEXT,
    "regionId" TEXT,
    "parentDestinationId" TEXT,
    "categoryIds" TEXT[],
    "description" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "seo" JSONB NOT NULL,
    "gallery" JSONB NOT NULL,
    "faqs" JSONB NOT NULL,
    "guideReferenceIds" TEXT[],
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "durationNights" INTEGER NOT NULL,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "sourceTemplateId" TEXT,
    "aiGeneratedFromId" TEXT,
    "status" TEXT NOT NULL,
    "currentVersionId" TEXT,
    "seo" JSONB NOT NULL,
    "faqs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_days" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "destinationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_items" (
    "id" TEXT NOT NULL,
    "packageDayId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "resolutionMode" TEXT NOT NULL,
    "inventoryItemId" TEXT,
    "destinationReferenceId" TEXT,
    "slotCriteria" JSONB,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timeOfDay" TEXT,
    "notes" TEXT,
    "images" TEXT[],
    "pricingMode" TEXT NOT NULL,
    "addonPrice" DOUBLE PRECISION,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_pricing" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "markup" JSONB,
    "discount" JSONB,
    "tax" JSONB,
    "occupancyPricing" JSONB NOT NULL,
    "childPricing" JSONB NOT NULL,
    "infantPricing" JSONB,
    "groupPricing" JSONB NOT NULL,
    "seasonalPricing" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_rules" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "cancellationTiers" JSONB NOT NULL,
    "paymentTerms" JSONB,
    "refundPolicy" TEXT,
    "bookingWindow" JSONB,
    "minPax" INTEGER NOT NULL,
    "maxPax" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_availability" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "blackoutDates" TEXT[],
    "maxBookingsPerDay" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_versions" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "changeNote" TEXT,

    CONSTRAINT "package_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "packageId" TEXT,
    "travelerDetails" JSONB NOT NULL,
    "currency" TEXT NOT NULL,
    "adjustments" JSONB NOT NULL,
    "currentVersionId" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "internalNotes" TEXT,
    "customerNotes" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "convertedAt" TIMESTAMP(3),
    "convertedBookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_items" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "packageId" TEXT,
    "inventoryItemId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_versions" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "changeNote" TEXT,

    CONSTRAINT "quote_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sourceQuoteId" TEXT NOT NULL,
    "sourceQuoteNumber" TEXT NOT NULL,
    "sourceQuoteVersionId" TEXT,
    "destinationId" TEXT NOT NULL,
    "packageId" TEXT,
    "currency" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "internalNotes" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "ticketedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_items" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "packageId" TEXT,
    "inventoryItemId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "supplierBookingReference" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travellers" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isLeadTraveller" BOOLEAN NOT NULL DEFAULT false,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "nationality" TEXT,
    "passportNumber" TEXT,
    "passportExpiry" TIMESTAMP(3),
    "visaRequired" BOOLEAN NOT NULL DEFAULT false,
    "emergencyContact" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger_documents" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "travellerId" TEXT,
    "kind" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passenger_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "method" TEXT,
    "status" TEXT NOT NULL,
    "reference" TEXT,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_invoices" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "billTo" JSONB NOT NULL,
    "currency" TEXT NOT NULL,
    "lineItems" JSONB NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "amountDue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_vouchers" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "voucherNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "leadTravellerName" TEXT NOT NULL,
    "destinationName" TEXT NOT NULL,
    "validity" JSONB,
    "items" JSONB NOT NULL,
    "supplierReferences" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_status_history" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,

    CONSTRAINT "booking_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_timeline_entries" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "details" TEXT,

    CONSTRAINT "booking_timeline_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_notes" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "rememberMe" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedByTokenId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "ipAddress" TEXT,
    "deviceInfo" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorUserId" TEXT,
    "targetUserId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_items_kind_idx" ON "inventory_items"("kind");

-- CreateIndex
CREATE INDEX "inventory_items_destinationId_idx" ON "inventory_items"("destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_records_code_key" ON "supplier_records"("code");

-- CreateIndex
CREATE INDEX "states_countryId_idx" ON "states"("countryId");

-- CreateIndex
CREATE INDEX "regions_countryId_idx" ON "regions"("countryId");

-- CreateIndex
CREATE INDEX "cities_countryId_idx" ON "cities"("countryId");

-- CreateIndex
CREATE INDEX "cities_stateId_idx" ON "cities"("stateId");

-- CreateIndex
CREATE INDEX "airports_cityId_idx" ON "airports"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "destination_categories_slug_key" ON "destination_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_slug_key" ON "destinations"("slug");

-- CreateIndex
CREATE INDEX "destinations_countryId_idx" ON "destinations"("countryId");

-- CreateIndex
CREATE INDEX "destinations_parentDestinationId_idx" ON "destinations"("parentDestinationId");

-- CreateIndex
CREATE INDEX "destinations_status_idx" ON "destinations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "packages_code_key" ON "packages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "packages_slug_key" ON "packages"("slug");

-- CreateIndex
CREATE INDEX "packages_destinationId_idx" ON "packages"("destinationId");

-- CreateIndex
CREATE INDEX "packages_status_idx" ON "packages"("status");

-- CreateIndex
CREATE INDEX "package_days_packageId_idx" ON "package_days"("packageId");

-- CreateIndex
CREATE INDEX "package_items_packageDayId_idx" ON "package_items"("packageDayId");

-- CreateIndex
CREATE INDEX "package_items_inventoryItemId_idx" ON "package_items"("inventoryItemId");

-- CreateIndex
CREATE UNIQUE INDEX "package_pricing_packageId_key" ON "package_pricing"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "package_rules_packageId_key" ON "package_rules"("packageId");

-- CreateIndex
CREATE INDEX "package_availability_packageId_idx" ON "package_availability"("packageId");

-- CreateIndex
CREATE INDEX "package_versions_packageId_idx" ON "package_versions"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_quoteNumber_key" ON "quotes"("quoteNumber");

-- CreateIndex
CREATE INDEX "quotes_destinationId_idx" ON "quotes"("destinationId");

-- CreateIndex
CREATE INDEX "quotes_status_idx" ON "quotes"("status");

-- CreateIndex
CREATE INDEX "quote_items_quoteId_idx" ON "quote_items"("quoteId");

-- CreateIndex
CREATE INDEX "quote_versions_quoteId_idx" ON "quote_versions"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_bookingNumber_key" ON "bookings"("bookingNumber");

-- CreateIndex
CREATE INDEX "bookings_sourceQuoteId_idx" ON "bookings"("sourceQuoteId");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "booking_items_bookingId_idx" ON "booking_items"("bookingId");

-- CreateIndex
CREATE INDEX "travellers_bookingId_idx" ON "travellers"("bookingId");

-- CreateIndex
CREATE INDEX "passenger_documents_bookingId_idx" ON "passenger_documents"("bookingId");

-- CreateIndex
CREATE INDEX "booking_payments_bookingId_idx" ON "booking_payments"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_invoices_invoiceNumber_key" ON "booking_invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "booking_invoices_bookingId_idx" ON "booking_invoices"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_vouchers_voucherNumber_key" ON "booking_vouchers"("voucherNumber");

-- CreateIndex
CREATE INDEX "booking_vouchers_bookingId_idx" ON "booking_vouchers"("bookingId");

-- CreateIndex
CREATE INDEX "booking_status_history_bookingId_idx" ON "booking_status_history"("bookingId");

-- CreateIndex
CREATE INDEX "booking_timeline_entries_bookingId_idx" ON "booking_timeline_entries"("bookingId");

-- CreateIndex
CREATE INDEX "booking_notes_bookingId_idx" ON "booking_notes"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE INDEX "user_roles_userId_idx" ON "user_roles"("userId");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_sessionId_idx" ON "refresh_tokens"("sessionId");

-- CreateIndex
CREATE INDEX "login_history_userId_idx" ON "login_history"("userId");

-- CreateIndex
CREATE INDEX "password_resets_userId_idx" ON "password_resets"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_eventType_idx" ON "audit_logs"("eventType");

-- CreateIndex
CREATE INDEX "audit_logs_actorUserId_idx" ON "audit_logs"("actorUserId");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");
