-- ════════════════════════════════════════════════════════════════════════════
--  0003 — content domain tables
--    • hotels
--    • packages + package_destinations + package_hotels + package_categories
--    • guides
--    • ferry_routes
--    • flight_routes
--
--  Every table FKs into destinations.id (or destination_categories.id).
--  M2M joins use composite primary keys plus a back-index on the "other"
--  side so reads from either direction stay O(1) on the join.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Hotels ─────────────────────────────────────────────────────────────────
CREATE TABLE "hotels" (
  "id"               BIGSERIAL PRIMARY KEY,
  "destination_id"   BIGINT NOT NULL REFERENCES "destinations"("id") ON DELETE RESTRICT,

  "name"             TEXT NOT NULL,
  "slug"             TEXT NOT NULL UNIQUE,

  "star_rating"      INTEGER,
  "short_description" TEXT,
  "hero_image_url"   TEXT,
  "gallery"          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  "meta_title"       TEXT,
  "meta_description" TEXT,
  "seo_content"      TEXT,

  "status"           "DestinationStatus" NOT NULL DEFAULT 'DRAFT',
  "is_featured"      BOOLEAN NOT NULL DEFAULT FALSE,
  "sort_order"       INTEGER NOT NULL DEFAULT 0,

  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "published_at"     TIMESTAMPTZ,

  CONSTRAINT hotels_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT hotels_star_rating_range CHECK (star_rating IS NULL OR (star_rating >= 1 AND star_rating <= 7))
);

CREATE INDEX "hotels_destination_status_sort_idx"
  ON "hotels" ("destination_id", "status", "sort_order")
  WHERE "status" = 'PUBLISHED';

CREATE TRIGGER hotels_set_updated_at
  BEFORE UPDATE ON hotels
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Packages ───────────────────────────────────────────────────────────────
CREATE TABLE "packages" (
  "id"               BIGSERIAL PRIMARY KEY,

  "title"            TEXT NOT NULL,
  "slug"             TEXT NOT NULL UNIQUE,

  "short_description" TEXT,
  "duration_days"    INTEGER,
  "duration_nights"  INTEGER,
  "starting_price"   INTEGER,
  "currency"         TEXT NOT NULL DEFAULT 'INR',

  "hero_image_url"   TEXT,
  "gallery"          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  "meta_title"       TEXT,
  "meta_description" TEXT,
  "seo_content"      TEXT,

  "status"           "DestinationStatus" NOT NULL DEFAULT 'DRAFT',
  "is_featured"      BOOLEAN NOT NULL DEFAULT FALSE,
  "sort_order"       INTEGER NOT NULL DEFAULT 0,

  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "published_at"     TIMESTAMPTZ,

  CONSTRAINT packages_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT packages_duration_sane CHECK (
    (duration_days IS NULL OR duration_days >= 1) AND
    (duration_nights IS NULL OR duration_nights >= 0)
  )
);

CREATE INDEX "packages_status_featured_idx"
  ON "packages" ("status", "is_featured", "sort_order")
  WHERE "status" = 'PUBLISHED';

CREATE TRIGGER packages_set_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── package_destinations (M2M) ────────────────────────────────────────────
CREATE TABLE "package_destinations" (
  "package_id"       BIGINT NOT NULL REFERENCES "packages"("id") ON DELETE CASCADE,
  "destination_id"   BIGINT NOT NULL REFERENCES "destinations"("id") ON DELETE CASCADE,

  "is_primary"       BOOLEAN NOT NULL DEFAULT FALSE,
  "sort_order"       INTEGER NOT NULL DEFAULT 0,
  "nights"           INTEGER,

  PRIMARY KEY ("package_id", "destination_id")
);

CREATE INDEX "package_destinations_destination_idx" ON "package_destinations" ("destination_id");

-- Each package has at most one primary destination.
CREATE UNIQUE INDEX "package_destinations_primary_per_pkg_uq"
  ON "package_destinations" ("package_id")
  WHERE "is_primary" = TRUE;

-- ─── package_hotels (M2M) ──────────────────────────────────────────────────
CREATE TABLE "package_hotels" (
  "package_id"       BIGINT NOT NULL REFERENCES "packages"("id") ON DELETE CASCADE,
  "hotel_id"         BIGINT NOT NULL REFERENCES "hotels"("id") ON DELETE CASCADE,

  "nights"           INTEGER,
  "sort_order"       INTEGER NOT NULL DEFAULT 0,

  PRIMARY KEY ("package_id", "hotel_id")
);

CREATE INDEX "package_hotels_hotel_idx" ON "package_hotels" ("hotel_id");

-- ─── package_categories (M2M to destination_categories) ────────────────────
CREATE TABLE "package_categories" (
  "package_id"       BIGINT NOT NULL REFERENCES "packages"("id") ON DELETE CASCADE,
  "category_id"      BIGINT NOT NULL REFERENCES "destination_categories"("id") ON DELETE CASCADE,

  "sort_order"       INTEGER NOT NULL DEFAULT 0,

  PRIMARY KEY ("package_id", "category_id")
);

CREATE INDEX "package_categories_category_idx" ON "package_categories" ("category_id");

-- ─── Guides ─────────────────────────────────────────────────────────────────
CREATE TABLE "guides" (
  "id"               BIGSERIAL PRIMARY KEY,
  "destination_id"   BIGINT NOT NULL REFERENCES "destinations"("id") ON DELETE RESTRICT,

  "title"            TEXT NOT NULL,
  "slug"             TEXT NOT NULL UNIQUE,

  "excerpt"          TEXT,
  "body"             TEXT,
  "reading_minutes"  INTEGER,
  "hero_image_url"   TEXT,

  "meta_title"       TEXT,
  "meta_description" TEXT,

  "status"           "DestinationStatus" NOT NULL DEFAULT 'DRAFT',
  "is_featured"      BOOLEAN NOT NULL DEFAULT FALSE,
  "sort_order"       INTEGER NOT NULL DEFAULT 0,

  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "published_at"     TIMESTAMPTZ,

  CONSTRAINT guides_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE INDEX "guides_destination_status_sort_idx"
  ON "guides" ("destination_id", "status", "sort_order")
  WHERE "status" = 'PUBLISHED';

CREATE TRIGGER guides_set_updated_at
  BEFORE UPDATE ON guides
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Ferry routes ──────────────────────────────────────────────────────────
CREATE TABLE "ferry_routes" (
  "id"               BIGSERIAL PRIMARY KEY,
  "destination_id"   BIGINT NOT NULL REFERENCES "destinations"("id") ON DELETE RESTRICT,

  "name"             TEXT NOT NULL,
  "slug"             TEXT NOT NULL UNIQUE,

  "origin_name"      TEXT NOT NULL,
  "destination_name" TEXT NOT NULL,
  "operator_name"    TEXT,

  "duration_minutes" INTEGER,
  "starting_price"   INTEGER,
  "currency"         TEXT NOT NULL DEFAULT 'INR',

  "meta_title"       TEXT,
  "meta_description" TEXT,

  "status"           "DestinationStatus" NOT NULL DEFAULT 'DRAFT',
  "is_featured"      BOOLEAN NOT NULL DEFAULT FALSE,
  "sort_order"       INTEGER NOT NULL DEFAULT 0,

  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT ferry_routes_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE INDEX "ferry_routes_destination_status_sort_idx"
  ON "ferry_routes" ("destination_id", "status", "sort_order")
  WHERE "status" = 'PUBLISHED';

CREATE TRIGGER ferry_routes_set_updated_at
  BEFORE UPDATE ON ferry_routes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Flight routes ─────────────────────────────────────────────────────────
CREATE TABLE "flight_routes" (
  "id"               BIGSERIAL PRIMARY KEY,
  "destination_id"   BIGINT NOT NULL REFERENCES "destinations"("id") ON DELETE RESTRICT,

  "name"             TEXT NOT NULL,
  "slug"             TEXT NOT NULL UNIQUE,

  "origin_iata"      TEXT NOT NULL,
  "dest_iata"        TEXT NOT NULL,
  "origin_city"      TEXT NOT NULL,
  "dest_city"        TEXT NOT NULL,

  "approx_duration_minutes" INTEGER,
  "starting_price"   INTEGER,
  "currency"         TEXT NOT NULL DEFAULT 'INR',

  "meta_title"       TEXT,
  "meta_description" TEXT,

  "status"           "DestinationStatus" NOT NULL DEFAULT 'DRAFT',
  "is_featured"      BOOLEAN NOT NULL DEFAULT FALSE,
  "sort_order"       INTEGER NOT NULL DEFAULT 0,

  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT flight_routes_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT flight_routes_iata_format CHECK (
    origin_iata ~ '^[A-Z]{3}$' AND dest_iata ~ '^[A-Z]{3}$'
  )
);

CREATE INDEX "flight_routes_destination_status_sort_idx"
  ON "flight_routes" ("destination_id", "status", "sort_order")
  WHERE "status" = 'PUBLISHED';

CREATE INDEX "flight_routes_iata_pair_idx"
  ON "flight_routes" ("origin_iata", "dest_iata");

CREATE TRIGGER flight_routes_set_updated_at
  BEFORE UPDATE ON flight_routes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
